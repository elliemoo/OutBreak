# Define here the models for your scraped items
#
# See documentation in:
# https://docs.scrapy.org/en/latest/topics/items.html

import scrapy


class IncidentscraperItem(scrapy.Item):
    id = scrapy.Field()
    url = scrapy.Field()
    date_of_publication = scrapy.Field()
    headline = scrapy.Field()
    main_text = scrapy.Field()
    reports = scrapy.Field()
    search_locations = scrapy.Field()
    search_diseases = scrapy.Field()
    search_symptoms = scrapy.Field()
    search_terms = scrapy.Field()
    search_date = scrapy.Field()


class Report(scrapy.Item):
    diseases = scrapy.Field()
    syndromes = scrapy.Field()
    event_date = scrapy.Field()
    locations = scrapy.Field()


class Location(scrapy.Item):
    country = scrapy.Field()
    location = scrapy.Field()
