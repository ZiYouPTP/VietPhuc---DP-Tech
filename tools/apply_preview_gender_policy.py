"""Record the user's 09/10/2026 body selection policy; no historical claims."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
file = ROOT / 'viet-phuc-remix/data/outfit-rules.json'
data = json.loads(file.read_text(encoding='utf-8'))
# This is a one-time data migration from the user's explicit selection request.
male = {'ao-ngu-than', 'ao-giao-linh'}
for collection in ('outfitSets', 'itemRules'):
    for row in data[collection]:
        if collection == 'outfitSets' or row['slot'] == 'outer':
            row['supportedGenders'] = ['male', 'female'] if row['id'] in male else ['female']
            row['genderPolicy'].update(scope='user-body-preview-policy', origin='user-instruction-2026-10-09',
                                      historicalUse=None, unknownGenderPolicy='disable-unsupported-body',
                                      verificationTodo='TODO: đây là giới hạn phối ảnh do người dùng chọn, không phải quy tắc lịch sử về giới tính.')
data['verificationTodo'] = 'TODO: người dùng duyệt quy tắc phối đầy đủ; giới hỗ trợ đã cập nhật theo yêu cầu 09/10/2026. Chưa có nguồn lịch sử hay palette C2.'
inventory = json.loads((ROOT / 'ASSET_INVENTORY_DRAFT.json').read_text(encoding='utf-8'))
data['assetGenderPolicy'] = []
for item in inventory['items']:
    stem = Path(item['file']).stem
    supported = ['male'] if stem == 'aonguthan_male' else ['male', 'female'] if stem == 'aogiaolinh' else ['female']
    data['assetGenderPolicy'].append({'sourceFile': item['file'], 'supportedGenders': supported,
                                    'origin': 'user-instruction-2026-10-09', 'historicalClaim': False,
                                    'sources': [], 'needsVerification': True, 'status': 'needsVerification',
                                    'verificationTodo': 'TODO: giới hạn xem/phối ảnh theo yêu cầu người dùng, không phải khẳng định lịch sử.'})
file.write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print('Recorded male outerwear policy: ao-ngu-than, ao-giao-linh only')
