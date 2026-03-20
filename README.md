# FAA Aircraft Registration Parser

A **100% offline, standalone** tool for parsing and exploring FAA aircraft registration data.

## No Installation Required

Just double-click `FAADecorder.html` and it opens in your existing web browser (Chrome, Edge, Firefox).

- No software to install
- No IT permissions needed
- No internet connection — ever
- All data stays on your machine

## How to Use

1. Download the FAA registration files from the FAA website (do this from a machine with internet access):
   - `MASTER.txt` — Active registrations (**required**)
   - `DEREG.txt` — Deregistered aircraft (optional)
   - `ACFTREF.txt` — Aircraft make/model reference (optional)
   - `ENGINE.txt` — Engine reference (optional)

2. Copy `FAADecorder.html` and the FAA data files to your laptop.

3. Double-click `FAADecorder.html` to open it in your browser.

4. Drag and drop (or click to browse) each file onto the matching dropzone.

5. Use the filters to search by N-Number, owner name, make, model, state, year, and more.

6. Export filtered results to CSV at any time.

## Privacy & Security

- The file is entirely self-contained — all CSS and JavaScript are embedded inline.
- No network requests are made at any point.
- Data is processed entirely in your browser's memory and never transmitted anywhere.
- Safe to use on air-gapped or restricted corporate networks.
