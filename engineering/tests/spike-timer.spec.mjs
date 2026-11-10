import { test, expect } from '@playwright/test';
import { openTab } from './helpers.mjs';

// The clock is faked so the countdown can be run forward instead of waited out.
test.beforeEach(async ({ page }) => {
  await page.clock.install();
  await page.goto('/index.html');
  await openTab(page, 'thermal');
});

const clock = page => page.locator('#spikeClock');
const status = page => page.locator('#spikeStatus');

test('plans the default spike: 300% with no coolant holds about 5 s', async ({ page }) => {
  await expect(clock(page)).toHaveText('0:05');
  await expect(status(page)).toContainText('About 7 s to climb to 300%, then hold for 5 s and reset at about 70°');
});

test('coolant lengthens the hold, and enough of it needs no reset', async ({ page }) => {
  await page.click('#spikePowerBtns [data-power="200"]');
  await page.click('#spikeCoolantBtns [data-coolant="25"]');
  await expect(clock(page)).toHaveText('0:44');
  await page.click('#spikePowerBtns [data-power="150"]');
  await expect(status(page)).toContainText('hold for 7m 40s');
  await page.click('#spikeCoolantBtns [data-coolant="75"]');
  await expect(status(page)).toContainText('holds indefinitely');
  await expect(page.locator('#spikeStart')).toBeDisabled();
  await expect(page.locator('#spikeCoolantBtns [data-coolant="75"]')).toHaveAttribute('aria-pressed', 'true');
});

test('counts the climb, then the hold, then calls the reset', async ({ page }) => {
  await page.click('#spikeStart');
  await expect(page.locator('#spikeStart')).toHaveText('Stop');
  await expect(status(page)).toHaveText('Climbing to 300%.');
  await page.clock.runFor(7000);
  await expect(status(page)).toContainText('Holding at 300%');
  await page.clock.runFor(5000);
  await expect(status(page)).toContainText('Reset now');
  await expect(page.locator('#spikeBox')).toHaveClass(/reset/);
  await page.click('#spikeStart');   // Done
  await expect(clock(page)).toHaveText('0:05');
  await expect(page.locator('#spikeBox')).not.toHaveClass(/reset/);
});

test('changing the spike mid-count starts the plan again', async ({ page }) => {
  await page.click('#spikeStart');
  await page.clock.runFor(3000);
  await page.click('#spikeCoolantBtns [data-coolant="100"]');
  await expect(page.locator('#spikeStart')).toHaveText('Start spike');
  await expect(clock(page)).toHaveText('0:22');
});
