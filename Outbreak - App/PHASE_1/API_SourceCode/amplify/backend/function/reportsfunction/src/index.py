import json
import logging
import re
from datetime import datetime
import boto3
from boto3.dynamodb.conditions import Attr

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('outbreaksDatabaseNew-staging')

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def getErrorResponse(statusCode, message):
    return {
        'statusCode': statusCode,
        'headers': {
            'Content-Type': 'application/json'
        },
        'body': json.dumps({
            'message': message
        })
    }


def handler(event, context):
    print('received event:')
    print(event)

    queryParams, keyTerms, startDate, endDate, location = None, None, None, None, None

    if 'queryStringParameters' in event and not event["queryStringParameters"] == None:
        queryParams = event["queryStringParameters"]
    else:
        response = getErrorResponse(
            400, 'Please provide a period of interest, key terms, or a location')
        logger.info('Response JSON:')
        logger.info(json.dumps(response))
        return response

    filterExpression = None
    firstFilterExpression = True

    if queryParams:
        if 'terms' in queryParams:
            if queryParams['terms']:
                keyTerms = queryParams['terms'].split(',')
                for term in keyTerms:
                    search = Attr('search_terms').contains(term.lower())
                    filterExpression = search if firstFilterExpression else filterExpression & search 
                    firstFilterExpression = False

        if 'start_date' in queryParams and not 'end_date' in queryParams \
                or 'end_date' in queryParams and not 'start_date' in queryParams:
            return getErrorResponse(400, 'Please enter both start date and end date')
        elif 'start_date' in queryParams and 'end_date' in queryParams:
            startDate = queryParams['start_date']
            endDate = queryParams['end_date']
            if not (re.search('^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)$', startDate)
                    and re.search('^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)$', endDate)):
                return getErrorResponse(400, 'Invalid start date and/or end date')
            elif datetime.fromisoformat(startDate) > datetime.fromisoformat(endDate):
                return getErrorResponse(400, 'Start date cannot be after end date')
            else:
                search = Attr('search_date').between(startDate, endDate)
                filterExpression = search if firstFilterExpression else filterExpression & search
                firstFilterExpression = False

        if 'location' in queryParams:
            location = queryParams['location']
            if not location:
                response = getErrorResponse(
                    400, 'Please provide a period of interest, key terms, or a location')
                logger.info('Response JSON:')
                logger.info(json.dumps(response))
                return response
            search = Attr('search_locations').contains(location.lower())
            filterExpression = search if firstFilterExpression else filterExpression & search
            firstFilterExpression = False

    if filterExpression == None:
        response = getErrorResponse(
            400, 'Please provide a period of interest, key terms, or a location')
        logger.info('Response JSON:')
        logger.info(json.dumps(response))
        return response

    response = table.scan(
        FilterExpression=filterExpression,
        ProjectionExpression="#urlfield, date_of_publication, headline, main_text, reports",
        ExpressionAttributeNames={"#urlfield": "url"}
    )
    items = response['Items']

    if not items:
        response = getErrorResponse(404, 'No results found')
        logger.info('Response JSON:')
        logger.info(json.dumps(response))
        return response

    dateNow = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    items.append(
        {
            "logs": {
                "team": "git push --force",
                "accessed-time": dateNow,
                "data-source": "Global incident map"
            }
        }
    )

    response = {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json'
        },
        'body': json.dumps(items)
    }
    logger.info('Response JSON:')
    logger.info(json.dumps(response))
    return response
