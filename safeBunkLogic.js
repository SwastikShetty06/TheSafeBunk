/**
 * Safe Bunk Algorithm Verification Script
 * 
 * Logic:
 * 1. Safe Bunk (Current % > Target): P / (T + x) >= Target
 * 2. Recovery (Current % < Target): (P + y) / (T + y) >= Target
 */

function calculateSafeBunk(attended, total, targetMsg) { // targetMsg e.g. 0.75
    const target = targetMsg;
    const currentPercentage = attended / total;

    console.log(`\n--- Status Report ---`);
    console.log(`Attended: ${attended}, Total: ${total}`);
    console.log(`Current Percentage: ${(currentPercentage * 100).toFixed(2)}%`);
    console.log(`Target: ${(target * 100)}%`);

    if (currentPercentage >= target) {
        // Safe: How many can I bunk?
        // Formula: floor((attended / target) - total)
        // Check: 12 attended, 15 total, 75% target.
        // 12/0.75 = 16. 16 - 15 = 1. Correct.
        const safeBunks = Math.floor((attended / target) - total);
        console.log(`✅ SAFE: You can safely bunk ${safeBunks} classes.`);
        return { status: 'SAFE', value: safeBunks };
    } else {
        // Danger: How many must I attend?
        // Formula: ceil((target * total - attended) / (1 - target))
        // Check: 10 attended, 15 total, 75% target (66% curr).
        // (0.75 * 15 - 10) / 0.25 => (11.25 - 10) / 0.25 => 1.25 / 0.25 => 5.
        // Verify: (10+5)/(15+5) = 15/20 = 75%. Correct.
        const needed = Math.ceil((target * total - attended) / (1 - target));
        console.log(`❌ DANGER: You must attend the next ${needed} classes to recover.`);
        return { status: 'DANGER', value: needed };
    }
}

// Test Cases
console.log("TEST CASE 1: Safe Scenario");
calculateSafeBunk(12, 15, 0.75); // Exp: 1 bunk

console.log("\nTEST CASE 2: Danger Scenario");
calculateSafeBunk(10, 15, 0.75); // Exp: 5 classes

console.log("\nTEST CASE 3: On The Edge");
calculateSafeBunk(11.25, 15, 0.75); // Theoretical checking
// Let's stick to integers for real usage
calculateSafeBunk(15, 20, 0.75); // 75% -> 0 bunks (safe but 0)

console.log("\nTEST CASE 4: High Attendance");
calculateSafeBunk(20, 20, 0.75); // 100% -> 20/0.75 = 26.66 -> 26 - 20 = 6 bunks.
// Check: 20 / (20 + 6) = 20/26 = 0.769 (OK)
// Check: 20 / (20 + 7) = 20/27 = 0.740 (Fail)
// So 6 is correct.

console.log("\nTEST CASE 5: Very Low Attendance");
calculateSafeBunk(0, 10, 0.75); // 0% -> (7.5 - 0)/0.25 = 30 classes needed.
// Check: 30 / 40 = 0.75. Correct.
