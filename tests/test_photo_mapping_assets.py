"""Current production mapping: originals intact, complete photos and body policy."""
import unittest, hashlib, json
from pathlib import Path
import numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]

class PhotoMappingAssets(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.items=json.loads((ROOT/'assets/web/photo-catalog.json').read_text(encoding='utf-8'))['items']
  cls.sources=json.loads((ROOT/'assets/web/source-inventory.json').read_text(encoding='utf-8'))['items']
 def test_current_sources_preserved(self):
  self.assertEqual(len(self.sources),21)
  for item in self.sources:self.assertEqual(hashlib.sha256((ROOT/item['file']).read_bytes()).hexdigest(),item['sha256'])
 def test_complete_photo_pixel_content_retained(self):
  self.assertEqual(len(self.items),10)
  for item in self.items:
   original=Image.open(ROOT/item['sourceFile']).convert('RGB')
   actual=Image.open(ROOT/item['file']).convert('RGB')
   self.assertLess(abs((actual.width/actual.height)/(original.width/original.height)-1),.005)
   expected=original.resize(actual.size,Image.Resampling.LANCZOS)
   rms=np.sqrt(np.mean((np.asarray(actual,dtype=float)-np.asarray(expected,dtype=float))**2))
   self.assertLess(rms,10,item['key'])
   self.assertEqual(hashlib.sha256((ROOT/item['sourceFile']).read_bytes()).hexdigest(),item['sourceSha256'])
   self.assertFalse(item['preparation']['generated']);self.assertFalse(item['preparation']['warp']);self.assertFalse(item['preparation']['crop'])
 def test_body_policy_and_real_hat_variant(self):
  male=[item for item in self.items if item['gender']=='male']
  self.assertEqual({item['costumeId'] for item in male},{'ao-ngu-than','ao-giao-linh'});self.assertEqual(len(male),2)
  female=[item for item in self.items if item['gender']=='female']
  self.assertEqual(len({item['costumeId'] for item in female}),7)
  self.assertEqual(next(i for i in female if i['accessories']==['non-la'])['sourceFile'],'assets/aodai2.png')
  self.assertEqual(next(i for i in female if i['costumeId']=='ao-ngu-than')['sourceFile'],'assets/aonguthan_female.png')
 def test_catalog_is_small_unique_and_not_culturally_certified(self):
  self.assertEqual(len({item['key'] for item in self.items}),len(self.items))
  self.assertLess(sum((ROOT/item['file']).stat().st_size for item in self.items),500000)
  for item in self.items:self.assertEqual(item['sources'],[]);self.assertTrue(item['needsVerification']);self.assertIn('TODO',item['verificationTodo'])

if __name__=='__main__':unittest.main()
