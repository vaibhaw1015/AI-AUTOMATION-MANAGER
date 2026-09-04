import csv
import os
import random
from datetime import datetime, timedelta

def generate_datasets(output_dir="data"):
    os.makedirs(output_dir, exist_ok=True)
    random.seed(42)

    base_date = datetime(2026, 8, 1)

    exact_vendors = [
        ("Acme Corporation", 1250.00, "INV-1001", "WIRE"),
        ("Slack Technologies Inc", 840.00, "SUB-SLK-201", "ACH"),
        ("Deel Global Payroll", 14500.00, "PAY-DEEL-88", "WIRE"),
        ("Zoom Video Comm", 249.90, "SUB-ZM-912", "CARD"),
        ("Datadog Cloud Monitoring", 3200.00, "INV-DD-304", "ACH"),
        ("HubSpot Inc", 1800.00, "INV-HB-552", "ACH"),
        ("Figma Enterprise", 450.00, "SUB-FIG-102", "CARD"),
        ("Cloudflare CDN", 200.00, "INV-CF-889", "ACH"),
        ("Twilio Communications", 1680.50, "INV-TW-401", "ACH"),
        ("Snowflake Data Cloud", 5400.00, "INV-SNOW-901", "WIRE"),
        ("Salesforce.com Inc", 7200.00, "INV-SF-112", "WIRE"),
        ("Atlassian Jira/Confluence", 950.00, "SUB-ATL-780", "CARD"),
        ("Carta Equity Mgmt", 2500.00, "INV-CRT-334", "ACH"),
        ("MongoDB Atlas", 1120.00, "INV-MDB-551", "CARD"),
        ("Workday HCM", 8900.00, "INV-WD-441", "WIRE"),
        ("Vanta Compliance", 3500.00, "INV-VN-202", "ACH"),
        ("Ramp Financial", 120.00, "FEE-RMP-01", "ACH"),
        ("Zendesk Support Suite", 2100.00, "INV-ZEN-667", "ACH"),
        ("Asana Enterprise", 650.00, "SUB-ASN-991", "CARD"),
        ("DigitalOcean Droplets", 420.00, "INV-DO-772", "CARD"),
        ("Brex Corporate Pay", 4500.00, "PAY-BRX-112", "WIRE"),
        ("Gusto Payroll Transfer", 11200.00, "PAY-GST-890", "ACH"),
        ("OpenAI API Platform", 1850.00, "SUB-OAI-334", "CARD"),
        ("Stripe Terminal Hardware", 790.00, "INV-STR-091", "CARD"),
        ("DocuSign Corporate", 920.00, "INV-DOC-448", "ACH"),
        ("Notion Team Enterprise", 800.00, "SUB-NTN-221", "CARD"),
        ("Segment Data Streams", 1500.00, "INV-SEG-114", "ACH"),
        ("Linear Software", 360.00, "SUB-LIN-772", "CARD"),
        ("Vercel Pro Hosting", 240.00, "SUB-VRC-003", "CARD"),
        ("GitHub Enterprise Server", 1490.00, "SUB-GH-882", "CARD"),
        ("SendGrid Email API", 450.00, "INV-SG-993", "ACH"),
        ("Miro Team Collaboration", 320.00, "SUB-MIR-441", "CARD"),
        ("1Password Business", 299.00, "SUB-1PW-881", "CARD"),
        ("Grammarly Business", 180.00, "SUB-GRM-002", "CARD"),
        ("Loom Video Enterprise", 250.00, "SUB-LM-661", "CARD"),
        ("Canva Design Teams", 149.00, "SUB-CNV-554", "CARD"),
        ("Postman Enterprise API", 890.00, "INV-PST-771", "ACH")
    ]
    assert len(exact_vendors) == 37, f"Expected 37 exact matches, got {len(exact_vendors)}"

    fuzzy_pairs = [
        # (Bank Desc, Bank Amt, Bank DateOffset, Ledger Desc, Ledger Amt, Ledger DateOffset, Ref, Reason)
        ("AMZN WEB SERV AWS EMEA SEATTLE", 6840.50, 4, "Amazon Web Services Inc - Cloud Hosting", 6840.50, 2, "AWS-AUG-26", "Abbreviation + 2d date drift"),
        ("INBOUND WIRE CUST 808 ACME CORP", 4999.00, 5, "Acme Corp - Enterprise Annual License 1", 5000.00, 3, "INV-ACM-808", "₹1 / $1 wire fee deduction + 2d drift"),
        ("GSUITE_CC_US881 GOOGLE APPS", 720.00, 6, "Google Workspace Corporate Account", 720.00, 5, "GSUITE-AUG", "Name abbreviation"),
        ("NOTION LABS INTL USD CONVERT", 3420.48, 10, "Notion Labs Team Plan EUR Converted", 3420.50, 9, "NTN-INTL-10", "Penny rounding drift (2 cents)"),
        ("STRIPE PAYMENTS PAYOUT BATCH 991", 9710.00, 12, "Customer Invoices Batch Gross Revenue", 10000.00, 10, "STR-PO-991", "2.9% merchant gateway fee deduction"),
        ("MSFT *AZURE EMEA OPERATIONS", 4500.00, 14, "Microsoft Corporation - Azure US/EU", 4500.00, 12, "MSFT-AZ-114", "Prefix noise + 2d lag"),
        ("INTL WIRE TRF INTERCOM R&D", 2965.00, 15, "Intercom Messaging Platform Annual", 3000.00, 14, "INT-8821", "$35 intermediary bank wire fee"),
        ("FEDEX FREIGHT CORP EXPRESS", 345.80, 17, "Federal Express Logistics Package Delivery", 345.80, 15, "FDX-7721", "Vendor name abbreviation"),
        ("UBER FOR BUSINESS RIDES BATCH", 890.20, 18, "Uber Technologies Inc - Monthly Employee Rides", 890.00, 18, "UBR-BIZ-89", "Penny tip drift (20 cents)"),
        ("ORACLE AMERICA CLOUD INFRA", 8200.00, 20, "Oracle Corp - ERP Database Cloud Services", 8200.00, 18, "ORA-CLD-90", "Date lag (2 days)"),
        ("LINKEDIN TALENT RECRUITING", 1250.00, 21, "LinkedIn Corporation - Talent Solutions Recruiter", 1250.00, 20, "LNKD-AUG-21", "Counterparty token overlap"),
        ("EXPENSIFY INC MONTHLY FEES", 490.00, 23, "Expensify Corporate Card Processing", 490.00, 21, "EXPF-AUG-44", "Date lag (2 days)"),
        ("AIRBNB WORK TRAVEL SAN JOSE", 1420.50, 24, "Airbnb Payments UK - Annual Leadership Offsite", 1420.50, 22, "ABNB-TRV-10", "Entity geographical variation"),
        ("INTUIT QUICKBOOKS PAYROLL SVC", 580.00, 25, "Intuit Software - Monthly Payroll Filing", 580.00, 24, "QB-PAY-580", "Abbreviated suffix"),
        ("APPLE STORE R551 CUPERTINO", 2499.00, 26, "Apple Inc - Developer Mac Hardware", 2499.00, 25, "AAPL-DEV-99", "Retail store prefix")
    ]
    assert len(fuzzy_pairs) == 15, f"Expected 15 fuzzy matches, got {len(fuzzy_pairs)}"

    bank_exceptions = [
        # (Desc, Amt, DateOffset, Ref, Category)
        ("SVB WIRE SERVICE CHARGE DOMESTIC", -35.00, 28, "FEE-SVB-AUG", "bank-only (unrecorded bank fee)"),
        ("UNKNOWN INBOUND REMIT REF 99812", 1250.00, 28, "UNREC-REM-99", "bank-only (missing invoice)"),
        ("GITHUB INC RECURRING SUB DUPL", -149.00, 22, "CARD-GH-DUP", "duplicate (suspected double charge)"),
        ("FOREIGN EXCHANGE DISPATCH FEE", -18.50, 27, "FX-FEE-27", "bank-only (currency fee)"),
        ("ATM CASH WITHDRAWAL HARBOR ST", -200.00, 29, "ATM-WITH-29", "bank-only (unrecorded debit)"),
        ("STRIPE CHARGEBACK DISPUTE REVERSAL", -450.00, 29, "DISP-STR-45", "bank-only (chargeback clawback)"),
        ("MONTHLY ACCOUNT MAINTENANCE FEE", -25.00, 30, "MAINT-FEE-30", "bank-only (monthly bank fee)")
    ]
    assert len(bank_exceptions) == 7, f"Expected 7 bank exceptions, got {len(bank_exceptions)}"

    ledger_exceptions = [
        # (Desc, Amt, DateOffset, Ref, Category)
        ("Nexus Dynamics Deliverable Sign-off", 8800.00, 30, "INV-2026-109", "ledger-only (timing: deposit in transit)"),
        ("Cisco Systems Hardware Refresh Switch", -6500.00, 30, "PO-CISCO-88", "ledger-only (timing: check in transit)"),
        ("AdRoll Marketing Retargeting Campaign", -1200.00, 29, "INV-ADR-441", "ledger-only (unbilled ad charge)"),
        ("Pending Customer Check - TechFlow Ltd", 3400.00, 30, "CHK-TF-990", "ledger-only (uncollected check)"),
        ("Accrued Legal Fees - Cooley LLP", -2500.00, 30, "ACCR-LEG-26", "ledger-only (year-end accrual entry)")
    ]
    assert len(ledger_exceptions) == 5, f"Expected 5 ledger exceptions, got {len(ledger_exceptions)}"

    # Build bank_transactions.csv (37 exact + 15 fuzzy + 7 exceptions = 59 rows)
    bank_rows = []
    ledger_rows = []
    ground_truth_rows = []

    # 1. Exact Matches (37)
    for i, (vendor, amt, ref, method) in enumerate(exact_vendors):
        b_id = f"BNK_{i+1:03d}"
        l_id = f"LDG_{i+1:03d}"
        d_str = (base_date + timedelta(days=i % 25)).strftime("%Y-%m-%d")

        # Bank side
        b_desc = f"{vendor.upper()} {method} TRF {ref}"
        bank_rows.append({
            "bank_id": b_id,
            "date": d_str,
            "amount": amt,
            "description": b_desc,
            "reference_id": ref
        })

        # Ledger side
        l_desc = f"{vendor} - Monthly recurring service ({ref})"
        ledger_rows.append({
            "ledger_id": l_id,
            "date": d_str,
            "amount": amt,
            "description": l_desc,
            "reference_id": ref
        })

        ground_truth_rows.append({
            "link_id": f"LINK_{len(ground_truth_rows)+1:03d}",
            "bank_id": b_id,
            "ledger_id": l_id,
            "match_type": "exact",
            "variance": 0.0,
            "notes": "Exact match on date, amount, and reference"
        })

    # 2. Fuzzy Matches (15)
    for i, (b_desc, b_amt, b_offset, l_desc, l_amt, l_offset, ref, reason) in enumerate(fuzzy_pairs):
        b_id = f"BNK_{37+i+1:03d}"
        l_id = f"LDG_{37+i+1:03d}"
        b_date = (base_date + timedelta(days=b_offset)).strftime("%Y-%m-%d")
        l_date = (base_date + timedelta(days=l_offset)).strftime("%Y-%m-%d")

        bank_rows.append({
            "bank_id": b_id,
            "date": b_date,
            "amount": b_amt,
            "description": b_desc,
            "reference_id": ref
        })

        ledger_rows.append({
            "ledger_id": l_id,
            "date": l_date,
            "amount": l_amt,
            "description": l_desc,
            "reference_id": ref
        })

        ground_truth_rows.append({
            "link_id": f"LINK_{len(ground_truth_rows)+1:03d}",
            "bank_id": b_id,
            "ledger_id": l_id,
            "match_type": "fuzzy",
            "variance": round(b_amt - l_amt, 2),
            "notes": reason
        })

    # 3. Bank-only Exceptions (7)
    for i, (b_desc, b_amt, b_offset, ref, cat) in enumerate(bank_exceptions):
        b_id = f"BNK_{52+i+1:03d}"
        b_date = (base_date + timedelta(days=b_offset)).strftime("%Y-%m-%d")

        bank_rows.append({
            "bank_id": b_id,
            "date": b_date,
            "amount": b_amt,
            "description": b_desc,
            "reference_id": ref
        })

        ground_truth_rows.append({
            "link_id": f"LINK_{len(ground_truth_rows)+1:03d}",
            "bank_id": b_id,
            "ledger_id": "NONE",
            "match_type": "exception",
            "variance": b_amt,
            "notes": cat
        })

    # 4. Ledger-only Exceptions (5)
    for i, (l_desc, l_amt, l_offset, ref, cat) in enumerate(ledger_exceptions):
        l_id = f"LDG_{52+i+1:03d}"
        l_date = (base_date + timedelta(days=l_offset)).strftime("%Y-%m-%d")

        ledger_rows.append({
            "ledger_id": l_id,
            "date": l_date,
            "amount": l_amt,
            "description": l_desc,
            "reference_id": ref
        })

        ground_truth_rows.append({
            "link_id": f"LINK_{len(ground_truth_rows)+1:03d}",
            "bank_id": "NONE",
            "ledger_id": l_id,
            "match_type": "exception",
            "variance": l_amt,
            "notes": cat
        })

    # Verify counts
    assert len(bank_rows) == 59, f"Bank rows count {len(bank_rows)} != 59"
    assert len(ledger_rows) == 57, f"Ledger rows count {len(ledger_rows)} != 57"
    assert len(ground_truth_rows) == 64, f"Ground truth links count {len(ground_truth_rows)} != 64"

    # Write CSVs
    bank_path = os.path.join(output_dir, "bank_transactions.csv")
    with open(bank_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["bank_id", "date", "amount", "description", "reference_id"])
        writer.writeheader()
        writer.writerows(bank_rows)

    ledger_path = os.path.join(output_dir, "ledger_entries.csv")
    with open(ledger_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["ledger_id", "date", "amount", "description", "reference_id"])
        writer.writeheader()
        writer.writerows(ledger_rows)

    gt_path = os.path.join(output_dir, "ground_truth.csv")
    with open(gt_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["link_id", "bank_id", "ledger_id", "match_type", "variance", "notes"])
        writer.writeheader()
        writer.writerows(ground_truth_rows)

    print(f"Generated synthetic benchmark dataset in '{output_dir}/':")
    print(f"  - bank_transactions.csv: {len(bank_rows)} rows")
    print(f"  - ledger_entries.csv:    {len(ledger_rows)} rows")
    print(f"  - ground_truth.csv:      {len(ground_truth_rows)} links (37 exact, 15 fuzzy, 12 exceptions)")

if __name__ == "__main__":
    generate_datasets("data")
