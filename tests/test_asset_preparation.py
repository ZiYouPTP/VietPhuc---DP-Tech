"""Offline matte/fit regressions, including source preservation and safe drafts."""
import hashlib
import importlib.util
import json
import unittest
from pathlib import Path

import numpy as np
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("prepare_remix_assets",ROOT/"tools/prepare_remix_assets.py")
prepare=importlib.util.module_from_spec(spec)
spec.loader.exec_module(prepare)


class MatteTests(unittest.TestCase):
    def test_enclosed_hat_background_uses_explicit_seed_without_erasing_fabric(self):
        pixels=np.full((40,40,4),255,dtype=np.uint8)
        pixels[4:36,4:36,:3]=[175,20,40]
        pixels[8:18,8:18,:3]=255
        pixels[22:32,22:32,:3]=255
        image,_=prepare.remove_border_white(Image.fromarray(pixels),background_seeds=[(12,12)])
        self.assertEqual(image.getpixel((12,12))[3],0)
        self.assertEqual(image.getpixel((25,25))[3],255)
        self.assertEqual(image.getpixel((5,5))[3],255)
    def test_flood_fill_preserves_enclosed_white_fabric(self):
        pixels=np.full((30,30,4),255,dtype=np.uint8)
        pixels[5:25,5:25,:3]=[175,20,40]
        pixels[10:20,10:20,:3]=255
        image,metrics=prepare.remove_border_white(Image.fromarray(pixels))
        self.assertEqual(image.getpixel((0,0))[3],0)
        self.assertEqual(image.getpixel((15,15))[3],255)
        self.assertEqual(image.getpixel((6,6))[3],255)
        self.assertGreater(metrics["backgroundPixelsRemoved"],0)

    def test_open_white_space_between_hat_straps_is_background(self):
        pixels=np.full((30,30,4),255,dtype=np.uint8)
        pixels[4:8,5:25,:3]=[190,80,50]
        pixels[8:25,5:8,:3]=[120,10,40]
        pixels[8:25,22:25,:3]=[120,10,40]
        image,_=prepare.remove_border_white(Image.fromarray(pixels))
        self.assertEqual(image.getpixel((15,15))[3],0)
        self.assertEqual(image.getpixel((6,15))[3],255)

    def test_alpha_cleanup_keeps_white_garment_and_disconnected_shoes(self):
        pixels=np.zeros((30,40,4),dtype=np.uint8)
        pixels[4:24,4:14]=[255,255,255,255]
        pixels[4:24,25:35]=[170,110,70,255]
        pixels[28,0]=[200,0,0,255]
        image,metrics=prepare.clean_alpha_noise(Image.fromarray(pixels))
        self.assertEqual(image.getpixel((8,8)),(255,255,255,255))
        self.assertEqual(image.getpixel((30,8))[3],255)
        self.assertEqual(image.getpixel((0,28))[3],0)
        self.assertEqual(metrics["speckPixelsRemoved"],1)


class FitTests(unittest.TestCase):
    def test_similarity_preserves_shape_and_applies_translation(self):
        pixels=np.zeros((100,40,4),dtype=np.uint8)
        pixels[20:24,10:30]=[255,0,0,255]
        pixels[78:82,10:30]=[0,0,255,255]
        image=Image.fromarray(pixels)
        fit={"mode":"similarity","rotation":0,"scale":2,"offsetX":5,"offsetY":7}
        layer=prepare.fit_canvas(image,fit,(105,290))
        self.assertEqual(layer.size,(105,290))
        self.assertGreater(layer.getpixel((45,49))[0],240)
        self.assertGreater(layer.getpixel((45,167))[2],240)
        self.assertEqual(prepare.map_point([20,80],fit,image.size,(105,290)),[45.0,167.0])

    def test_rotation_rejected_and_invalid_panel_order_rejected(self):
        image=Image.new("RGBA",(40,100))
        with self.assertRaises(ValueError):
            prepare.fit_canvas(image,{"mode":"canvas","rotation":25},(40,100))
        with self.assertRaises(ValueError):
            prepare.fit_canvas(image,{"mode":"canvas","verticalMap":[[0,0],[40,40],[30,80]]},(40,100))

    def test_box_retains_entire_garment_on_exact_body_canvas(self):
        image=Image.new("RGBA",(200,200))
        image.paste((180,40,80,255),(20,20,80,120))
        fit={"mode":"box","sourceBox":[20,20,80,120],"targetBox":[30,45,60,95],"rotation":0}
        layer=prepare.fit_canvas(image,fit,(105,290))
        self.assertEqual(layer.size,(105,290))
        self.assertEqual(layer.getpixel((31,46))[3],255)
        self.assertEqual(layer.getpixel((60,96))[3],0)
        self.assertEqual(prepare.map_point([20,20],fit,image.size,(105,290)),[30.0,45.0])


class PreparedManifestTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.manifest=json.loads((ROOT/"assets/clothing_manifest.json").read_text(encoding="utf-8"))
        cls.inventory=json.loads((ROOT/"ASSET_INVENTORY_DRAFT.json").read_text(encoding="utf-8"))

    def test_current_sources_preserved_and_old_fit_snapshot_retained(self):
        items=self.manifest["items"]
        self.assertEqual(len(items),15)
        self.assertEqual(len({item["sourceSha256"] for item in items}),15)
        # The user replaced the source photos on 10/10. The old fit manifest is
        # an archived experiment; current mapping has its own fresh inventory.
        current=json.loads((ROOT/"assets/web/source-inventory.json").read_text(encoding="utf-8"))
        for original in current["items"]:
            digest=hashlib.sha256((ROOT/original["file"]).read_bytes()).hexdigest()
            self.assertEqual(digest,original["sha256"],original["file"])
        self.assertEqual(self.inventory["duplicateFiles"],[])
        self.assertIn("quan-aodai-fit-body2",{item["assetId"] for item in items})

    def test_both_gender_layers_have_exact_size_alpha_and_review_images(self):
        for item in self.manifest["items"]:
            for gender,(W,H,_) in prepare.BODY.items():
                image=Image.open(ROOT/item["layerFiles"][gender])
                self.assertEqual(image.mode,"RGBA",item["assetId"])
                self.assertEqual(image.size,(W,H),item["assetId"])
                alpha=np.asarray(image.getchannel("A"))
                self.assertGreater(int((alpha==0).sum()),W*H*.1,item["assetId"])
                self.assertGreater(int((alpha>128).sum()),0,item["assetId"])
                self.assertTrue((ROOT/"assets/review"/gender/(item["assetId"]+".png")).is_file())
                self.assertEqual(item["fit"][gender]["rotation"],0)
            self.assertTrue((ROOT/"assets/review"/(item["assetId"]+"-before-after.jpg")).is_file())

    def test_drafts_are_never_in_supported_genders_and_culture_is_explicit(self):
        for item in self.manifest["items"]:
            approved=[gender for gender,fit in item["fit"].items() if fit["status"]=="ready" and gender in item["allowedGenders"]]
            self.assertEqual(item["supportedGenders"],approved)
            self.assertEqual(item["status"],"ready" if approved else "draft")
            self.assertEqual(item["culturalInfo"]["sources"],[])
            self.assertTrue(item["culturalInfo"]["needsVerification"])
            self.assertIn("TODO",item["culturalInfo"]["verificationNote"])

    def test_male_asset_selection_has_exactly_two_originals(self):
        male=[item["assetId"] for item in self.manifest["items"] if "male" in item["allowedGenders"]]
        self.assertEqual(sorted(male),["aogiaolinh","aonguthan_male"])
        female=[item["assetId"] for item in self.manifest["items"] if "female" in item["allowedGenders"]]
        self.assertIn("aonguthan_female",female)
        self.assertNotIn("aonguthan_male",female)

    def test_new_pants_waist_and_hem_are_positioned_on_female_body(self):
        item=next(item for item in self.manifest["items"] if item["assetId"]=="quan-aodai-fit-body2")
        fit=item["fit"]["female"]
        self.assertAlmostEqual(579*fit["scale"]+fit["offsetY"],115,places=3)
        self.assertAlmostEqual(1895*fit["scale"]+fit["offsetY"],263,places=3)

    def test_residuals_include_uncertainty_and_are_not_fit_certification(self):
        observed=[]
        for item in self.manifest["items"]:
            for fit in item["fit"].values():
                self.assertFalse(fit["certifiesFit"])
                observed.extend(fit["landmarkResiduals"])
        self.assertGreater(len(observed),10)
        self.assertTrue(any(m["errorHeightPercent"] is not None and m["errorHeightPercent"]>2 for m in observed))
        self.assertTrue(any(m["errorPx"] is None for m in observed))
        self.assertTrue(all(m["uncertaintyPx"]>=2 for m in observed))


if __name__=="__main__":
    unittest.main()
