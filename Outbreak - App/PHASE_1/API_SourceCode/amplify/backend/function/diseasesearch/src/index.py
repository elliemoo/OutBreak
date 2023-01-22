import json
import logging
from datetime import datetime
import boto3
from boto3.dynamodb.conditions import Attr

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('outbreaksDatabaseNew-staging')

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def handler(event, context):
    print('received event:')
    print(event)

    queryDisease, disease, response, items = None, None, None, None

    if 'queryStringParameters' in event \
            and not event["queryStringParameters"] == None \
            and 'disease' in event["queryStringParameters"] \
            and event["queryStringParameters"]["disease"]:
        queryDisease = event["queryStringParameters"]["disease"]
    else:
        response = {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'message': 'Please provide a disease to search for'
            })
        }
        logger.info('Response JSON:')
        logger.info(json.dumps(response))
        return response

    response = table.scan(
        FilterExpression=Attr('search_diseases').contains(
            queryDisease.lower()),
        ProjectionExpression="#urlfield, date_of_publication, headline, main_text, reports",
        ExpressionAttributeNames={"#urlfield": "url"}
    )
    items = response['Items']

    if not items:
        response = {
            'statusCode': 404,
            'headers': {
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'message': 'No results found'
            })
        }
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
