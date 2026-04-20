import json
from eth_utils import keccak, to_hex

payload = {
    "registration_no": "20174304",
    "name": "Ramesh Agarwal",
    "gpa": "6.41",
    "subjects": [
        {"code": "ABM 517", "title": "AGRICULTURAL MARKETING MANAGEMENT", "credits": "2", "grade": "6.7"},
        {"code": "ABM 521", "title": "FARM BUSINESS MANAGEMENT", "credits": "2", "grade": "6.1"},
        {"code": "ABM 526", "title": "INTERNATIONAL TRADE & SUSTAINABILITY", "credits": "2", "grade": "6.2"},
        {"code": "ABM 528", "title": "GOVERNANCE", "credits": "2", "grade": "5.9"},
        {"code": "ABM 530", "title": "AGRIBUSINESS FINANCIAL MANAGEMENT", "credits": "2", "grade": "7.0"},
        {"code": "ABM 532", "title": "MANAGEMENT OF AGRICULTURAL INPUT MARKETING", "credits": "2", "grade": "5.6"},
        {"code": "ABM 537", "title": "AGRI-SUPPLY CHAIN MANAGEMENT", "credits": "2", "grade": "6.8"},
        {"code": "ABM 537", "title": "COMMODITY-FUTURE MARKETS AND DERIVATIVES", "credits": "2", "grade": "6.7"},
        {"code": "PGS 505", "title": "DISASTER MANAGEMENT", "credits": "1", "grade": "6.9"}
    ]
}

# Test different dumping options
print("1. Compact (no spaces):")
compact = json.dumps(payload, separators=(',', ':'))
print("   String:", compact)
print("   Hash:  ", to_hex(keccak(text=compact)))

print("\n2. Default Python (spaces after commas and colons):")
default = json.dumps(payload)
print("   Hash:  ", to_hex(keccak(text=default)))

print("\n3. Sorted Keys + Compact:")
sorted_compact = json.dumps(payload, separators=(',', ':'), sort_keys=True)
print("   Hash:  ", to_hex(keccak(text=sorted_compact)))

print("\n4. Sorted Keys + Default:")
sorted_default = json.dumps(payload, sort_keys=True)
print("   Hash:  ", to_hex(keccak(text=sorted_default)))
