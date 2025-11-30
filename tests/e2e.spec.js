import { test, expect } from '@playwright/test';

test.describe('MN Fire Exam Prep E2E', () => {
    test.beforeEach(async ({ page }) => {
        // Assuming the app is running locally on port 5173 (Vite default)
        await page.goto('http://localhost:5173');
    });

    test('Dashboard loads correctly', async ({ page }) => {
        await expect(page).toHaveTitle(/MN Fire Sprinkler Exam Prep/);
        await expect(page.getByText('Question Bank Info')).toBeVisible();
        await expect(page.getByText('Total Questions')).toBeVisible();
        await expect(page.getByText('Category Breakdown')).toBeVisible();
    });

    test('Rapid 10 Game Mode flow', async ({ page }) => {
        // Start Rapid 10
        await page.getByText('Rapid 10').click();

        // Check if game started
        await expect(page.getByText('Question 1 of 10')).toBeVisible();
        await expect(page.getByText('Score: 0')).toBeVisible();

        // Answer a question (click first option)
        const optionsGrid = page.getByTestId('options-grid');
        const firstBtn = optionsGrid.locator('button').first();

        await firstBtn.click();

        // Check for explanation
        await expect(page.getByText('Explanation')).toBeVisible();

        // Check Next button
        const nextBtn = page.getByRole('button', { name: 'Next Question' });
        await expect(nextBtn).toBeVisible();
        await nextBtn.click();

        // Check if moved to question 2
        await expect(page.getByText('Question 2 of 10')).toBeVisible();
    });

    test('Filter logic works', async ({ page }) => {
        // Get initial total count from StatsCard
        const statsCard = page.getByTestId('stats-card');

        // Toggle MN Statutes Only
        await page.getByRole('checkbox').first().check();

        // Check if stats updated (badge appeared)
        await expect(statsCard.getByText('MN Statutes Only')).toBeVisible();
    });
});
