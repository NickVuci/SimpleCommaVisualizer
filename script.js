// script.js

const centsThreshold = 25;  // Cents threshold to define a comma
const maxWidth = 1000;  // Max width for the animation
const animationDuration = 4;  // Total time for the final lines to appear in seconds

function parseRatio(ratioString) {
    const [numerator, denominator] = ratioString.split("/").map(Number);
    return { numerator, denominator };
}

function ratioToCents(ratio) {
    return 1200 * Math.log2(ratio);  // Convert ratio to cents
}

function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

function findComma(ratio1, ratio2, maxIterations = 100) {
    for (let n1 = 1; n1 <= maxIterations; n1++) {
        for (let n2 = 1; n2 <= maxIterations; n2++) {
            const ratio1Stacked = {
                numerator: Math.pow(ratio1.numerator, n1),
                denominator: Math.pow(ratio1.denominator, n1)
            };
            const ratio2Stacked = {
                numerator: Math.pow(ratio2.numerator, n2),
                denominator: Math.pow(ratio2.denominator, n2)
            };

            const combinedNumerator = ratio1Stacked.numerator * ratio2Stacked.denominator;
            const combinedDenominator = ratio1Stacked.denominator * ratio2Stacked.numerator;
            const diffCents = Math.abs(ratioToCents(combinedNumerator / combinedDenominator));

            if (diffCents < centsThreshold) {
                const commonDivisor = gcd(combinedNumerator, combinedDenominator);
                let simplifiedNumerator = combinedNumerator / commonDivisor;
                let simplifiedDenominator = combinedDenominator / commonDivisor;

                // Ensure the numerator is greater than the denominator
                if (simplifiedNumerator < simplifiedDenominator) {
                    [simplifiedNumerator, simplifiedDenominator] = [simplifiedDenominator, simplifiedNumerator];
                }

                return {
                    n1,
                    n2,
                    diffCents: diffCents.toFixed(2),
                    commaRatio: `${simplifiedNumerator}/${simplifiedDenominator}`
                };
            }
        }
    }
    return null;
}

let isAnimating = false;

function startStacking() {
    if (isAnimating) {
        return;
    }
    isAnimating = true;
    const ratio1String = document.getElementById("ratio1").value;
    const ratio2String = document.getElementById("ratio2").value;

    if (!ratio1String || !ratio2String) {
        document.getElementById("results").innerHTML = "<p class='highlight'>Please enter two valid ratios!</p>";
        isAnimating = false;
        return;
    }

    const ratio1 = parseRatio(ratio1String);
    const ratio2 = parseRatio(ratio2String);

    // Find where the comma is
    const commaData = findComma(ratio1, ratio2);

    if (commaData === null) {
        document.getElementById("results").innerHTML = `<p class='highlight'>No comma found within 100 iterations for both ratios.</p>`;
        isAnimating = false;
        return;
    }

    const { n1, n2, diffCents, commaRatio } = commaData;

    // Clear previous visualization
    const visualContainer = document.getElementById("stacked-visual");
    visualContainer.innerHTML = ''; 

    // Add the stationary black line
    const stationaryLine = document.createElement("div");
    stationaryLine.classList.add("stationary-line");
    visualContainer.appendChild(stationaryLine);

    const totalLines = Math.max(n1, n2);
    const delayStep1 = (animationDuration / n1) * 1000;  // Delay for first ratio's lines
    const delayStep2 = (animationDuration / n2) * 1000;  // Delay for second ratio's lines

    for (let i = 1; i <= totalLines; i++) {
        // First ratio (blue)
        if (i <= n1) {
            const line1 = document.createElement("div");
            line1.classList.add("line");
            const leftPosition = (Math.log2(Math.pow(ratio1.numerator / ratio1.denominator, i)) / Math.log2(Math.pow(ratio1.numerator / ratio1.denominator, n1))) * maxWidth;
            line1.style.left = `${leftPosition}px`;

            // Add the delay for appearance
            setTimeout(() => {
                visualContainer.appendChild(line1);
                if (i === n1) {
                    line1.classList.add('highlight');
                    highlightMatchingPoint(line1);
                }
                if (i === totalLines) {
                    isAnimating = false;
                }
            }, i * delayStep1);
        }

        // Second ratio (red)
        if (i <= n2) {
            const line2 = document.createElement("div");
            line2.classList.add("line2");
            const leftPosition2 = (Math.log2(Math.pow(ratio2.numerator / ratio2.denominator, i)) / Math.log2(Math.pow(ratio2.numerator / ratio2.denominator, n2))) * maxWidth;
            line2.style.left = `${leftPosition2}px`;

            // Add the delay for appearance
            setTimeout(() => {
                visualContainer.appendChild(line2);
                if (i === n2) {
                    line2.classList.add('highlight');
                    highlightMatchingPoint(line2);
                }
                if (i === totalLines) {
                    isAnimating = false;
                }
            }, i * delayStep2);
        }
    }

    // Display the results
    document.getElementById("results").innerHTML = `
        <p>The comma was found after stacking ratio <strong>${ratio1String}</strong> <strong>${n1}</strong> times and ratio <strong>${ratio2String}</strong> <strong>${n2}</strong> times.</p>
        <p>The difference at that point is <strong>${diffCents}</strong> cents, which equals the ratio <strong>${commaRatio}</strong>.</p>`;
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const button = document.querySelector('button[onclick="toggleDarkMode()"]');
    if (document.body.classList.contains('dark-mode')) {
        button.textContent = 'Toggle Light Mode';
    } else {
        button.textContent = 'Toggle Dark Mode';
    }
}

function highlightMatchingPoint(line) {
    line.style.transition = 'transform 0.5s ease-in-out';
    line.style.transform = 'scale(1.2)';
    setTimeout(() => {
        line.style.transform = 'scale(1)';
    }, 500);
}

function toggleExplanation() {
    const explanationText = document.getElementById('explanation-text');
    if (explanationText.style.maxHeight === '0px' || explanationText.style.maxHeight === '') {
        explanationText.style.maxHeight = explanationText.scrollHeight + 'px';
    } else {
        explanationText.style.maxHeight = '0';
    }
}