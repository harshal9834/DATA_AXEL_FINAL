import json
import sys

def load_json(filepath):
    try:
        with open(filepath, 'r', encoding='utf-16') as f:
            data = json.load(f)
            return {item['Path']: item['Hash'] for item in data}
    except UnicodeError:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return {item['Path']: item['Hash'] for item in data}

backend = load_json('backend_hashes.json')
frontend_backend = load_json('frontend_backend_hashes.json')

unique_in_backend = set(backend.keys()) - set(frontend_backend.keys())
unique_in_frontend_backend = set(frontend_backend.keys()) - set(backend.keys())
differing = []

for file in set(backend.keys()).intersection(set(frontend_backend.keys())):
    if backend[file] != frontend_backend[file]:
        differing.append(file)

print("Unique in backend:", unique_in_backend)
print("Unique in frontend_backend:", unique_in_frontend_backend)
print("Differing:", differing)
