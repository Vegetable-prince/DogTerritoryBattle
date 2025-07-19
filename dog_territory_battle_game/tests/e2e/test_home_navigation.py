from selenium.webdriver import Remote
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import unittest

class HomePageNavigationTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.live_server_url = 'http://frontend:3000'

        options = Options()
        # options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')

        cls.driver = Remote(
            command_executor='http://selenium_chrome:4444',
            options=options
        )
        cls.driver.implicitly_wait(10)

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()

    def test_navigation_to_game_page(self):
      self.driver.get(self.live_server_url)

      # ✅ タイトルテキストが含まれる要素を待つ（例：h1タグ）
      WebDriverWait(self.driver, 10).until(
          EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Dog Territory Battle')]"))
      )

      # 上記で待ったあとならpage_sourceにも含まれるはず
      assert "Dog Territory Battle" in self.driver.page_source

      link = self.driver.find_element(By.LINK_TEXT, "ゲームへ")
      link.click()

      WebDriverWait(self.driver, 10).until(
          EC.url_contains("/games/1")
      )
      self.assertIn("/games/1", self.driver.current_url)