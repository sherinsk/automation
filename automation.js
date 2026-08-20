import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const browser = await chromium.launch({
    headless: false
});

const page = await browser.newPage();

const filePath = path.join(
    __dirname,
    "index.html"
);

await page.goto(`file://${filePath}`);

await page.waitForSelector("#tableBody tr");


// =====================================================
// ARRAY FOR ERROR IDS
// =====================================================

const errorIds = [];


// =====================================================
// CONFIGURATION
// =====================================================

const TOTAL_PAGES = 10;

const TOAST_TIMEOUT = 10000;


// =====================================================
// PROCESS CURRENT PAGE
// =====================================================

async function processCurrentPage() {

    await page.waitForSelector("#tableBody tr");

    const rows = page.locator("#tableBody tr");

    const rowCount = await rows.count();


    for (let i = 0; i < rowCount; i++) {

        // =================================================
        // GET CURRENT ROW
        // =================================================

        const currentRows =
            page.locator("#tableBody tr");

        const row =
            currentRows.nth(i);


        // =================================================
        // GET ID FROM FIRST TABLE COLUMN
        // =================================================

        const id =
            (
                await row
                    .locator("td")
                    .first()
                    .innerText()
            ).trim();


        // =================================================
        // CLICK VIEW
        // =================================================

        await row
            .locator(".view-btn")
            .click();


        // =================================================
        // WAIT FOR MODAL
        // =================================================

        const modal =
            page.locator("#modalOverlay");

        await modal.waitFor({
            state: "visible",
            timeout: 5000
        });


        // =================================================
        // CLICK PROCESS ORDER
        // =================================================

        await page
            .locator("#modalActionBtn")
            .click();


        // =================================================
        // NOW WAIT FOR ERROR TOAST
        // =================================================

        const toast =
            page.locator("#errorToast");


        let toastAppeared = false;


        try {

            await toast.waitFor({
                state: "visible",
                timeout: TOAST_TIMEOUT
            });

            toastAppeared = true;

        } catch {

            toastAppeared = false;

        }


        // =================================================
        // TOAST APPEARED
        // =================================================

        if (toastAppeared) {

            const toastText =
                await toast.innerText();


            // Only store ID if it is actually
            // the "Something went wrong" toast

            if (
                toastText.includes(
                    "Something went wrong"
                )
            ) {

               console.log({id})
                errorIds.push(id);

            }


            // =================================================
            // WAIT FOR TOAST TO DISAPPEAR
            // =================================================

            try {

                await toast.waitFor({
                    state: "hidden",
                    timeout: 5000
                });

            } catch {

                // Ignore timeout

            }

        }


        // =================================================
        // CLOSE MODAL
        // =================================================

        const closeButton =
            page.locator("#closeModal");


        if (
            await closeButton.isVisible()
        ) {

            await closeButton.click();

        }


        // =================================================
        // WAIT FOR MODAL TO CLOSE
        // =================================================

        await modal.waitFor({
            state: "hidden",
            timeout: 5000
        });


        // =================================================
        // NEXT ROW
        // =================================================

        await page.waitForTimeout(200);

    }

}


// =====================================================
// PROCESS ALL PAGES
// =====================================================

for (
    let pageNumber = 1;
    pageNumber <= TOTAL_PAGES;
    pageNumber++
) {

    console.log(
        `Processing page ${pageNumber}...`
    );


    await processCurrentPage();


    // =================================================
    // NEXT PAGE
    // =================================================

    if (
        pageNumber < TOTAL_PAGES
    ) {

        await page
            .locator("#nextBtn")
            .click();


        await page.waitForSelector(
            "#tableBody tr"
        );

    }

}


// =====================================================
// FINAL RESULT
// =====================================================

console.log("");
console.log("======================================");
console.log("AUTOMATION FINISHED");
console.log("======================================");

console.log("Error IDs:");

console.log(errorIds);

console.log(
    "Total errors:",
    errorIds.length
);

console.log("======================================");


// =====================================================
// CLOSE BROWSER
// =====================================================

await browser.close();