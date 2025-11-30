import { test, expect } from '@playwright/test';

test.describe('Exam Schedule Component', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173');
    });

    test('should display exam schedule and toggle calendar', async ({ page }) => {
        // Verify component is visible
        await expect(page.getByText('EXAM SCHEDULE')).toBeVisible();
        await expect(page.getByText('Reg. Closes in 56 Days')).toBeVisible();

        // Verify "VIEW CALENDAR" button exists
        const toggleBtn = page.getByRole('button', { name: 'VIEW CALENDAR' });
        await expect(toggleBtn).toBeVisible();

        // Click to expand
        await toggleBtn.click();

        // Verify "HIDE CALENDAR" text appears
        await expect(page.getByRole('button', { name: 'HIDE CALENDAR' })).toBeVisible();

        // Verify calendar content is visible
        await expect(page.getByText('St. Paul, MN').first()).toBeVisible();
        await expect(page.getByText('User Guide')).toBeVisible();
        await expect(page.getByText('SFM Portal')).toBeVisible();

        // Click to collapse
        await page.getByRole('button', { name: 'HIDE CALENDAR' }).click();

        // Verify "VIEW CALENDAR" returns
        await expect(page.getByRole('button', { name: 'VIEW CALENDAR' })).toBeVisible();
    });
});
