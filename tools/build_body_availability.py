"""Compile body availability from the reviewed JSON, for classic-script loading."""
from pathlib import Path
import json
import argparse

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'viet-phuc-remix/data/outfit-rules.json'
TARGET = ROOT / 'viet-phuc-remix/js/bodyAvailabilityData.js'


def compiled():
    data = json.loads(SOURCE.read_text(encoding='utf-8'))
    policy = {row['id']: {'supportedGenders': row['supportedGenders'], 'forbiddenItemIds': row['forbiddenItemIds'],
                         'allowedAccessoryIds': [id for slot in row['optionalSlots'] for id in slot['allowedItemIds']]} for row in data['outfitSets']}
    return '// Generated from data/outfit-rules.json. Run python tools/build_body_availability.py; do not edit.\n' + \
        '(function(scope){scope.VietPhucBodyAvailabilityData=' + json.dumps(policy, ensure_ascii=False, separators=(',', ':')) + \
        ';})(typeof window!=="undefined"?window:globalThis);\n'


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    source = compiled()
    if args.check:
        if not TARGET.exists() or TARGET.read_text(encoding='utf-8') != source:
            raise SystemExit('Body availability bundle does not match outfit-rules.json')
        print('Body availability bundle matches JSON: PASS')
    else:
        TARGET.write_text(source, encoding='utf-8')
        print('Generated viet-phuc-remix/js/bodyAvailabilityData.js')
