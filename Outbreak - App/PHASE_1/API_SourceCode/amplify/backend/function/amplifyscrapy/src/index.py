import scrapy
from scrapy.crawler import CrawlerRunner
import json
import os
import re

# Required for aws lambda calls to not fail during 2nd time of running
from crochet import setup, wait_for

# Import helper scrapy files
from translator import *
from items import *

# Import boto3 for database reading
import boto3
from boto3.dynamodb.conditions import Key

TABLE_NAME = 'outbreaksDatabaseNew-staging'
setup()


def get_lower(list):
    output = []
    for item in list:
        output.append(item.lower())
    return output


def title_collector(title):
    title = re.sub('^\[.*].*\-\s', "", title)
    return title


def description_collector(data):
    texts = []
    for item in data:
        if not item.isspace():
            texts.append(item)
    return texts


def syndrome_collector(input):
    output = []
    for item in input:
        if(get_syndromes(item)):
            output.append(get_syndromes(item))

    return list(dict.fromkeys(output))


def key_term_collector(input):
    output = []
    for item in input:
        if(get_terms(item)):
            output.append(get_terms(item))
    return list(dict.fromkeys(output))


class IncidentSpider(scrapy.Spider):
    name = 'incident'
    url = 'http://outbreaks.globalincidentmap.com'
    start_urls = [url]

    # TimeScale: 1, 7, 30, 60, 365-> for Display Events (drop down option)
    # Default option is 30days, we could fetch everything by using "ALL" and
    # and update it every week(7) or everyday (1)
    def parse(self, response):
        data = {
            'TimeScale': '7'
        }
        yield scrapy.FormRequest.from_response(response, formname='frmFilter', formdata=data, callback=self.prase_home)
    # looping through response -> every class="tdline" which has class='a.b2' attrbute
    # this extracts all of detailed links and crawl

    def prase_home(self, response):
        for virus in response.css('td.tdline').css('a.b2::attr(href)'):
            detailed_page = virus.get()
            yield scrapy.Request(response.urljoin("/"+detailed_page), callback=self.parse_detail)

    def parse_detail(self, response):
        items = IncidentscraperItem()

        items['id'] = response.url.split('ID=')[1]

        details = response.css('td.tdline::text')
        description = description_collector(response.xpath(
            '//tr[@class="tdtext"]//text()').extract())
        items['url'] = response.css('a')[1].attrib['href']
        items['date_of_publication'] = details[1].get().replace("\xa0", "")
        items['headline'] = title_collector(description[0])
        items['main_text'] = description[1]

        # initialise reports list
        # initilaise report item
        # assign diseases, syndromes, event_date, locations
        reports = []
        disease_collection = []
        report = Report()
        report["diseases"] = get_diseases(details[0].get().replace("\xa0", ""))
        disease_collection = get_lower(report["diseases"])
        report["syndromes"] = ""  # will be collected later
        report["event_date"] = details[1].get().replace("\xa0", "")

        # initialise locations list
        # initialise location item
        # locations : country , location
        locations = []
        location_collection = []
        location = Location()
        location['country'] = details[2].get().replace("\xa0", "")
        location_collection.append(
            details[2].get().lower().replace("\xa0", ""))
        location['location'] = details[3].get().replace("\xa0", "")
        location_collection.append(
            details[3].get().lower().replace("\xa0", ""))
        locations.append(location)
        # assigning locations field
        report['locations'] = locations

        reports.append(report)

        # assigning reports field
        items['reports'] = reports
        items['search_locations'] = location_collection
        items['search_diseases'] = disease_collection
        items['search_symptoms'] = []
        yield scrapy.Request(response.urljoin(items['url']), callback=self.parse_article, meta={'items': items})

    def parse_article(self, response):
        article_data = response.xpath('//text()').extract()
        hello = syndrome_collector(article_data)
        items = response.meta['items']
        reports = items['reports']
        reports[0]['syndromes'] = syndrome_collector(article_data)
        items['search_symptoms'] = get_lower(reports[0]['syndromes'])
        items['search_terms'] = key_term_collector(article_data)
        items['search_date'] = 'T'.join(
            items['date_of_publication'].split(' '))
        yield items


@wait_for(90)
def run_spider():
    process = CrawlerRunner({
        'FEED_FORMAT': 'json',
        'FEED_URI': '/tmp/output.json'
    })

    d = process.crawl(IncidentSpider)
    return d


def handler(event, context):
    # Delete previous file if exists
    if os.path.isfile('/tmp/output.json') == True:
        os.remove('/tmp/output.json')

    run_spider()

    # Code does not continue until the web scraper has finished
    with open("/tmp/output.json") as f:
        data = json.load(f)

    f.close()

    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(TABLE_NAME)

    # Write articles to database
    with table.batch_writer() as batch:
        for article in data:
            batch.put_item(Item=article)

    return {
        'statusCode': 200,
        'body': "Data written to database"
    }
