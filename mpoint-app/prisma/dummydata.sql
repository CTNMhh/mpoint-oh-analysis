-- Dummy-Daten für MarketplaceEntry
INSERT INTO "MarketplaceEntry" (
  id, "userId", category, title, "shortDescription", "longDescription", price, type, email, "publicEmail", location, deadline, skills, "createdAt", "updatedAt"
) VALUES
-- 1
('1', '35942a7b-f6f1-477c-bd64-5a10fd4ca5a2', 'DIENSTLEISTUNG', 'Website-Relaunch gesucht',
 'Wir suchen ein Team für Webentwicklung & Design. Moderne, responsive Website mit CMS-Integration gewünscht.',
 '<p>Wir suchen ein <strong>Team für Webentwicklung & Design</strong>. Unsere Anforderungen:</p><ul><li>Moderne, responsive Website</li><li>CMS-Integration (z.B. WordPress, Strapi)</li><li>SEO & Performance-Optimierung</li><li>Design nach Corporate Identity</li></ul><p>Bitte Referenzen und grobe Preisvorstellung angeben.</p>',
 '{"from":10000,"to":15000}', 'Anfrage', 'thomas.mueller@example.com', false, NULL, NULL, NULL, to_timestamp(1754568000), to_timestamp(1754568000)),
-- 2
('2', '35942a7b-f6f1-477c-bd64-5a10fd4ca5a2', 'PRODUKT', 'Büromöbel – Großabnahme',
 'Preiswerte Büromöbel für Startups - jetzt anbieten. Hochwertige Schreibtische, Stühle und Schränke.',
 '<p>Großabnahme von <strong>Büromöbeln</strong> für Startups:</p><ul><li>Schreibtische, Stühle, Schränke</li><li>Lieferung deutschlandweit</li><li>Rabatte ab 10 Stück</li></ul><p>Jetzt Angebot einholen!</p>',
 '{"from":299,"ab":true}', 'Angebot', 'julia.schmidt@firma.com', true, NULL, NULL, NULL, to_timestamp(1754488800), to_timestamp(1754488800)),
-- 3
('3', '35942a7b-f6f1-477c-bd64-5a10fd4ca5a2', 'DIGITALISIERUNG', 'KI-Einsatz im deutschen Mittelstand: Chancen und Herausforderungen',
 'Beratung zur Implementierung von KI-Lösungen und Automatisierungsprozesse für mittelständische Unternehmen.',
 '<p>Wir bieten <strong>Beratung zur Implementierung von KI-Lösungen</strong> und Automatisierungsprozessen für mittelständische Unternehmen.</p><ul><li>Analyse der Potenziale</li><li>Workshops & Schulungen</li><li>Begleitung bei der Umsetzung</li></ul><p>Kontaktieren Sie uns für ein individuelles Angebot.</p>',
 '{"from":150,"perHour":true}', 'Angebot', 'kontakt@ki-mittelstand.de', true, NULL, NULL, NULL, to_timestamp(1754316000), to_timestamp(1754316000)),
-- 4
('4', '35942a7b-f6f1-477c-bd64-5a10fd4ca5a2', 'NACHHALTIGKEIT', 'Nachhaltige Lieferketten aufbauen: Ein Leitfaden',
 'Strategieberatung für umweltfreundliche und sozial verantwortliche Beschaffungsprozesse in Ihrem Unternehmen.',
 '<p><strong>Strategieberatung</strong> für umweltfreundliche und sozial verantwortliche Beschaffungsprozesse:</p><ul><li>Analyse bestehender Lieferketten</li><li>Entwicklung nachhaltiger Strategien</li><li>Workshops für Ihr Team</li></ul><p>Wir helfen Ihnen, Ihre Lieferkette zukunftsfähig zu machen.</p>',
 '{"onRequest":true}', 'Angebot', 'jm@nachhaltigberatung.de', false, NULL, NULL, NULL, to_timestamp(1754143200), to_timestamp(1754143200)),
-- 5
('5', '35942a7b-f6f1-477c-bd64-5a10fd4ca5a2', 'MANAGEMENT', 'Remote Leadership: Best Practices für hybride Teams',
 'Schulungen und Workshops für Führungskräfte zur effektiven Leitung verteilter Teams in der neuen Arbeitswelt.',
 '<p><strong>Remote Leadership</strong>: Best Practices für hybride Teams.</p><ul><li>Schulungen für Führungskräfte</li><li>Workshops zur Team-Kommunikation</li><li>Tools & Methoden für hybrides Arbeiten</li></ul><p>Jetzt Workshop buchen!</p>',
 '{"from":1200,"perDay":true}', 'Angebot', 'lisa@leadership-tools.de', false, NULL, NULL, NULL, to_timestamp(1753970400), to_timestamp(1753970400)),
-- 6
('6', '35942a7b-f6f1-477c-bd64-5a10fd4ca5a2', 'PRODUKT', 'ERP-Software für KMU',
 'Maßgeschneiderte Enterprise Resource Planning Lösung für kleine und mittlere Unternehmen. Cloud-basiert und skalierbar.',
 '<p><strong>ERP-Software</strong> für KMU:</p><ul><li>Cloud-basiert & skalierbar</li><li>Individuelle Anpassung</li><li>Support & Schulung</li></ul><p>Demo & Testzugang verfügbar.</p>',
 '{"from":99,"ab":true,"perMonth":true}', 'Angebot', 'info@kleinerp.de', false, NULL, NULL, NULL, to_timestamp(1753365600), to_timestamp(1753365600)),
-- 7
('7', '35942a7b-f6f1-477c-bd64-5a10fd4ca5a2', 'PRODUKT', 'ERP-Software für KMU',
 'Maßgeschneiderte Enterprise Resource Planning Lösung für kleine und mittlere Unternehmen. Cloud-basiert und skalierbar.',
 '<p><strong>ERP-Software</strong> für KMU:</p><ul><li>Cloud-basiert & skalierbar</li><li>Individuelle Anpassung</li><li>Support & Schulung</li></ul><p>Demo & Testzugang verfügbar. Premium-Features ab € 199/Monat.</p>',
 '{"from":199,"ab":true,"perMonth":true}', 'Angebot', 'info@kleinerp.de', false, NULL, NULL, NULL, to_timestamp(1753279200), to_timestamp(1753279200));
