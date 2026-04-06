const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const ctaStart = content.indexOf('<!-- ===== CTA / CONTACT');
const footerStart = content.indexOf('<!-- ===== FOOTER');

// Extract the CTA fragment
const fragment = content.substring(ctaStart, footerStart);

// Find the first </section> in the fragment — that's where our clean section ends
const firstClose = fragment.indexOf('</section>');
console.log('First </section> at offset:', firstClose);
console.log('Content right before it:', fragment.substring(firstClose - 50, firstClose + 20));

// The good ending: ctaStart + firstClose + length of '</section>'
const goodEndChar = ctaStart + firstClose + '</section>'.length;
console.log('Good end char:', goodEndChar);
console.log('Content just after good end:', content.substring(goodEndChar, goodEndChar + 50));

// Now rebuild: everything before footer, but only up to first </section>
const before = content.substring(0, goodEndChar);
const after = content.substring(footerStart);

const result = before + '\n\n      ' + after;
fs.writeFileSync('index.html', result, 'utf8');
console.log('Done! New file length:', result.length);
