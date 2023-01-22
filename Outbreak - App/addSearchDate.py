# Script to add search_date field to all existing items in database

import re 
from datetime import datetime 
import boto3 

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('outbreaksDatabase-staging')

response = table.scan()

while 'LastEvaluatedKey' in response:
    allItems = response['Items']

    for item in allItems:
        key = item['id']
        date = 'T'.join(item['date_of_publication'].split(' '))
        
        print(f'updating: {key}')

        table.update_item(
            Key={
                'id': key
            },
            UpdateExpression="set search_date = :r",
            ExpressionAttributeValues={
                ':r': date,
            }
        )
    
    response = table.scan(
        ExclusiveStartKey=response['LastEvaluatedKey']
    )