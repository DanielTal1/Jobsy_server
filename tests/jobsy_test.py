import json
import string
import random

import requests
from datetime import datetime, timedelta

def test_login():
    url = 'http://localhost:3000/auth/login'
    data = {
        'username': 'ravid',
        'password': '1234567'
    }
    response = requests.post(url, json=data)
    assert response.status_code == 200


def test_login_wrong_password():
    url = 'http://localhost:3000/auth/login'
    data = {
        'username': 'ravid',
        'password': '1'
    }
    response = requests.post(url, json=data)
    assert response.status_code == 403


def test_login_not_exists():
    url = 'http://localhost:3000/auth/login'
    data = {
        'username': 'asfdgfhgjdgsfhgdydhfsrehe',
        'password': '1'
    }
    response = requests.post(url, json=data)
    assert response.status_code == 400



def test_registration_exist():
    url = 'http://localhost:3000/auth/register'
    data = {
        'username': 'ravid',
        'password': '1234567'
    }
    response = requests.post(url, json=data)
    assert response.status_code == 400


def test_get_jobs():
    url = 'http://localhost:3000/jobs/'
    response = requests.get(url)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1


def test_get_user_jobs():
    base_url = 'http://localhost:3000'
    username = 'ravid'
    url = f'{base_url}/jobs/user/{username}'
    response = requests.get(url)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1


def test_get_user_archive_jobs():
    base_url = 'http://localhost:3000'
    username = 'ravid'
    url = f'{base_url}/jobs/archive/{username}'
    response = requests.get(url)
    assert response.status_code == 200


def test_update_job():
    #get all the jobs of a user
    base_url = 'http://localhost:3000'
    username = 'ravid'
    initial_url = f'{base_url}/jobs/user/{username}'
    initial_response = requests.get(initial_url)
    assert initial_response.status_code == 200
    initial_data = initial_response.json()

    #get the id of the first job
    job_id = initial_data[0]['_id']
    url = f'{base_url}/jobs/{job_id}'
    # Calculate the interview date as today plus one month
    interview_date = datetime.now() + timedelta(days=30)
    interview_date_str = interview_date.isoformat()
    data = {
        'stage': 'apply',
        'next_interview': interview_date_str
    }
    response = requests.put(url, json=data)
    assert response.status_code == 200


def generate_random_string(length):
    letters = string.ascii_letters
    return ''.join(random.choice(letters) for _ in range(length))

#random string to create a job not already exist
random_string = generate_random_string(25)
random_string2 =  generate_random_string(25)

def test_create_job():
    url = 'http://localhost:3000/jobs'
    data = {
        'username': 'ravid',
        'company': random_string,
        'role': random_string,
        'location': random_string2,
        'url': '',
        'source': 0
    }
    response = requests.post(url, json=data)
    assert response.status_code == 200


def test_create_job_exists():
    # get all the jobs of a user
    base_url = 'http://localhost:3000'
    username = 'ravid'
    initial_url = f'{base_url}/jobs/user/{username}'
    initial_response = requests.get(initial_url)
    assert initial_response.status_code == 200
    initial_data = initial_response.json()
    first_job = initial_data[0]

    url = 'http://localhost:3000/jobs'
    data = {
        'username': 'ravid',
        'company': first_job['company'],
        'role': first_job['role'],
        'location': first_job['location'],
        'url': '',
        'source': 0
    }
    response = requests.post(url, json=data)
    assert response.status_code == 400


def test_update_pins():
    # get all the jobs of a user
    base_url = 'http://localhost:3000'
    username = 'ravid'
    initial_url = f'{base_url}/jobs/user/{username}'
    initial_response = requests.get(initial_url)
    assert initial_response.status_code == 200
    initial_data = initial_response.json()

    # get the id of the first job
    first_job_id = initial_data[0]['_id']
    base_url = 'http://localhost:3000'
    url = f'{base_url}/jobs/pin/0'
    job_ids = [first_job_id]
    headers = {'Content-Type': 'application/json'}
    data = json.dumps(job_ids)
    response = requests.put(url, headers=headers, data=data)
    assert response.status_code == 200


def test_update_pins_not_exist():
    base_url = 'http://localhost:3000'
    url = f'{base_url}/jobs/pin/0'
    job_ids = ['6481a5fd89d8d4e30f6a6c57dfdfdfdfdgfgfg']
    data = {'jobIds': job_ids}
    response = requests.put(url, json=data)
    assert response.status_code == 500


def test_update_archive():
    # get all the jobs of a user
    base_url = 'http://localhost:3000'
    username = 'ravid'
    initial_url = f'{base_url}/jobs/user/{username}'
    initial_response = requests.get(initial_url)
    assert initial_response.status_code == 200
    initial_data = initial_response.json()
    # get the id of the first job
    first_job_id = initial_data[0]['_id']

    base_url = 'http://localhost:3000'
    url = f'{base_url}/jobs/archive/0'
    job_ids = [first_job_id]
    headers = {'Content-Type': 'application/json'}
    data = json.dumps(job_ids)
    response = requests.put(url, headers=headers, data=data)
    assert response.status_code == 200

def test_delete_jobs_not_exist():
    base_url = 'http://localhost:3000'
    url = f'{base_url}/jobs'
    job_ids = ['6481a65a89d8d4e30f6a6c6afsfsfdfdsds']
    data = {'jobIds': job_ids}
    response = requests.delete(url, json=data)
    assert response.status_code == 500


def test_update_archive_not_exists():
    base_url = 'http://localhost:3000'
    url = f'{base_url}/jobs/archive/0'
    job_ids = ['6481a65a89d8d4e30f6a6c6afsfsfdfd']
    data = {'jobIds': job_ids}
    response = requests.put(url, json=data)
    assert response.status_code == 500

def test_get_all_comments():
    url = 'http://localhost:3000/comments/'
    response = requests.get(url)
    assert response.status_code == 200

def test_get_comments_by_company():
    # Prepare the request data
    base_url = 'http://localhost:3000'
    company = 'google'
    url = f'{base_url}/comments/{company}'
    response = requests.get(url)
    assert response.status_code == 200

def test_get_comments_by_company_not_exist():
    base_url = 'http://localhost:3000'
    company = 'appledffghfgsdgfdhdgsdsh'
    url = f'{base_url}/comments/{company}'
    response = requests.get(url)
    assert response.status_code == 500

def test_create_comment():
    url = 'http://localhost:3000/comments/'
    data = {
        'company': 'google',
        'username': 'ravid',
        'text': 'tough interview',
        'role': 'qa'
    }
    headers = {'Content-Type': 'application/json'}
    json_data = json.dumps(data)
    response = requests.post(url, headers=headers, data=json_data)
    assert response.status_code == 200


def test_create_comment_company_not_exists():
    url = 'http://localhost:3000/comments/'
    data = {
        'company': 'appledfdfgfgfgsff',
        'username': 'daniel',
        'text': 'tough interview',
        'role': 'qa'
    }
    headers = {'Content-Type': 'application/json'}
    json_data = json.dumps(data)
    response = requests.post(url, headers=headers, data=json_data)
    assert response.status_code == 500


def test_create_comment_user_not_exists():
    url = 'http://localhost:3000/comments/'
    data = {
        'company': 'google',
        'username': 'danielfgsdshjgydsdfngrfd',
        'text': 'tough interview',
        'role': 'qa'
    }
    headers = {'Content-Type': 'application/json'}
    json_data = json.dumps(data)
    response = requests.post(url, headers=headers, data=json_data)
    assert response.status_code == 500


def test_get_all_companies():
    url = 'http://localhost:3000/company/'
    response = requests.get(url)
    assert response.status_code == 200


def test_get_company_by_name():
    base_url = 'http://localhost:3000'
    company = 'google'
    url = f'{base_url}/company/{company}'
    response = requests.get(url)
    assert response.status_code == 200


def test_get_company_not_exist():
    base_url = 'http://localhost:3000'
    company = 'googledfdfdgfgdgdgdgfsdfedshrwhethgshfs'
    url = f'{base_url}/company/{company}'
    response = requests.get(url)
    assert response.status_code == 404


def test_get_recommendations():
    base_url = 'http://localhost:3000'
    company = 'ravid'
    url = f'{base_url}/recommendation/{company}'
    response = requests.get(url)
    assert response.status_code == 200



def test_get_recommendations_user_not_exist():
    base_url = 'http://localhost:3000'
    company = 'danieldfghdghwrfnhjgrehreh'
    url = f'{base_url}/recommendation/{company}'
    response = requests.get(url)
    assert response.status_code == 404


#makes sure there is no intersection between jobs and recommendations
def test_recommendation_not_in_jobs():
    base_url = 'http://localhost:3000'
    username = 'ravid'
    recommendation_url = f'{base_url}/recommendation/{username}'
    jobs_url = f'{base_url}/jobs/user/{username}'

    #get the recommendations
    response_recommendation = requests.get(recommendation_url)
    assert response_recommendation.status_code == 200
    recommendation_data = response_recommendation.json()

    #get the jobs
    response_jobs = requests.get(jobs_url)
    assert response_jobs.status_code == 200
    jobs_data = response_jobs.json()

    #verify that each recommendation does not appear in the jobs
    for recommendation in recommendation_data:
        recommendation_company = recommendation['company']
        recommendation_role = recommendation['role']
        recommendation_location = recommendation['location']
        for job in jobs_data:
            job_company = job['company']
            job_role = job['role']
            job_location = job['location']
            assert (
                recommendation_company != job_company or
                recommendation_role != job_role or
                recommendation_location != job_location
            )


def test_add_job_and_check_length():
    #get the job list
    base_url = 'http://localhost:3000'
    username = 'ravid'
    initial_url = f'{base_url}/jobs/user/{username}'
    initial_response = requests.get(initial_url)
    assert initial_response.status_code == 200
    initial_data = initial_response.json()
    initial_job_count = len(initial_data)

    #create a new job
    url = f'{base_url}/jobs'
    data = {
        'username': username,
        'company': random_string2,
        'role': random_string2,
        'location': random_string,
        'url': '',
        'source': 0
    }
    response = requests.post(url, json=data)
    assert response.status_code == 200

    #get the updated job list
    updated_response = requests.get(initial_url)
    assert updated_response.status_code == 200
    updated_data = updated_response.json()
    updated_job_count = len(updated_data)

    #check if the updated job list is longer by 1 element
    assert updated_job_count == initial_job_count + 1


def test_delete_job_and_check_length():
    #get all the jobs of a user
    base_url = 'http://localhost:3000'
    username = 'ravid'
    initial_url = f'{base_url}/jobs/user/{username}'
    initial_response = requests.get(initial_url)
    assert initial_response.status_code == 200
    initial_data = initial_response.json()
    initial_job_count = len(initial_data)

    #get the id of the first job
    first_job_id = initial_data[0]['_id']
    #delete the first job
    delete_url = f'{base_url}/jobs'
    headers = {'Content-Type': 'application/json'}
    delete_data = [first_job_id]  # List with the ID of the first job
    delete_response = requests.delete(delete_url, headers=headers, data=json.dumps(delete_data))
    assert delete_response.status_code == 200

    #get the updated job list
    updated_response = requests.get(initial_url)
    assert updated_response.status_code == 200
    updated_data = updated_response.json()
    updated_job_count = len(updated_data)

    #check if the updated job list is shorter by 1 element
    assert updated_job_count == initial_job_count - 1