import json
import re
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.robotparser import RobotFileParser

ROOT = Path(__file__).resolve().parents[1]

class SEOTests(unittest.TestCase):
    def test_canonical_and_identity(self):
        html = (ROOT / 'index.html').read_text(encoding='utf-8')
        data = json.loads((ROOT / 'data.json').read_text(encoding='utf-8'))
        self.assertIn('rel="canonical" href="https://balee.web.id/"', html)
        self.assertNotIn('iqbalbayhaqi.com', html)
        self.assertNotIn('iqbalbayhaqi.com', json.dumps(data))
        self.assertEqual(data['seo']['siteUrl'], 'https://balee.web.id')
        self.assertEqual(data['seo']['ogImage'], 'https://balee.web.id/assets/img/photo_profile.png')
        self.assertEqual(data['profile']['name'], 'Iqbal Baihaqi Abdullah')
        self.assertEqual(re.search(r'<title>(.*?)</title>', html).group(1), data['seo']['title'])
        self.assertIn(data['profile']['heroDescription'], html)
        self.assertIn(data['profile']['bio'], html)

    def test_accessible_headings(self):
        html = (ROOT / 'index.html').read_text(encoding='utf-8')
        self.assertEqual(len(re.findall(r'<h1\b', html)), 1)
        ids = set(re.findall(r'\bid="([^"]+)"', html))
        for reference in re.findall(r'aria-labelledby="([^"]+)"', html):
            for identifier in reference.split():
                self.assertIn(identifier, ids)

    def test_structured_data(self):
        html = (ROOT / 'index.html').read_text(encoding='utf-8')
        graph = json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>', html, re.S).group(1))['@graph']
        person = next(x for x in graph if x['@type'] == 'Person')
        self.assertEqual(person['jobTitle'], 'Software Engineer')
        self.assertEqual(person['worksFor']['name'], 'PT XLSMART Telecom Sejahtera Tbk')
        self.assertEqual(person['url'], 'https://balee.web.id/')
        for node in graph:
            self.assertNotIn('estimatedSalary', json.dumps(node))

    def test_sitemap_and_crawl_resources(self):
        tree = ET.parse(ROOT / 'sitemap.xml')
        urls = tree.findall('{*}url/{*}loc')
        self.assertEqual([x.text for x in urls], ['https://balee.web.id/'])
        robots = RobotFileParser()
        robots.parse((ROOT / 'robots.txt').read_text().splitlines())
        for bot in ['Googlebot', 'Bingbot', 'DuckDuckBot', 'Slurp', 'YandexBot', 'ExampleBot']:
            for path in ['/', '/data.json', '/content.js', '/style.css']:
                self.assertTrue(robots.can_fetch(bot, 'https://balee.web.id' + path))
        html = (ROOT / 'index.html').read_text(encoding='utf-8')
        image = re.search(r'property="og:image" content="https://balee.web.id/([^"]+)"', html).group(1)
        self.assertTrue((ROOT / image).is_file())

if __name__ == '__main__':
    unittest.main()
