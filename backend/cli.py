#!/usr/bin/env python3
"""
TestGen AI - Enterprise Python Command-Line Interface (Dark Mode Terminal)
Usage:
  python3 backend/cli.py "As a user, I want to reset my password using OTP..."
  python3 backend/cli.py --count 10 --export csv --out tests.csv
"""

import sys
import os
import json
import argparse

# Add parent directory
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app import synthesize_qa_test_cases, call_gemini_api

# ANSI Color Codes for Dark Mode Terminal
C_RESET = "\033[0m"
C_BOLD = "\033[1m"
C_DIM = "\033[2m"
C_CYAN = "\033[36m"
C_BLUE = "\033[34m"
C_GREEN = "\033[32m"
C_YELLOW = "\033[33m"
C_RED = "\033[31m"
C_MAGENTA = "\033[35m"
C_BG_DARK = "\033[48;5;235m"

def print_banner():
    print(f"{C_BOLD}{C_CYAN}")
    print("╔═══════════════════════════════════════════════════════════════════════════╗")
    print("║               TestGen AI • Enterprise Python QA CLI (Dark Mode)          ║")
    print("╚═══════════════════════════════════════════════════════════════════════════╝")
    print(f"{C_RESET}")

def main():
    parser = argparse.ArgumentParser(description="Generate structured QA test cases from natural language user stories.")
    parser.add_argument("story", nargs="?", default="", help="Natural language user story or requirement.")
    parser.add_argument("--story", "-s", dest="story_flag", default="", help="User story provided via flag.")
    parser.add_argument("--count", "-c", type=int, default=8, help="Number of test cases to generate (default: 8).")
    parser.add_argument("--priority", "-p", choices=["All", "High", "Medium", "Low"], default="All", help="Filter by priority.")
    parser.add_argument("--export", "-e", choices=["none", "json", "csv"], default="none", help="Export format.")
    parser.add_argument("--out", "-o", default="", help="Output file path.")
    parser.add_argument("--demo", action="store_true", help="Run with built-in banking authentication demo story.")

    args = parser.parse_args()

    story = (args.story_flag or args.story or "").strip()
    if args.demo or not story:
        story = "As a registered corporate banking user, I want to log into my account using my work email, master password, and SMS OTP verification so that I can securely access the financial dashboard."
        print(f"{C_DIM}Using demo banking user story:{C_RESET}\n{C_BOLD}{story}{C_RESET}\n")

    print_banner()
    print(f"{C_CYAN}► Analyzing User Story & Generating Test Suite (Target Cases: {args.count})...{C_RESET}")

    # Generate
    result = None
    if os.getenv("GEMINI_API_KEY"):
        result = call_gemini_api(story, args.count)

    if not result:
        result = synthesize_qa_test_cases(story, args.count, priority_filter=args.priority)

    cov = result["coverage"]
    print(f"\n{C_BOLD}=== QA RELEVANCE & COVERAGE MATRIX ==={C_RESET}")
    print(f"Overall Coverage Score : {C_BOLD}{C_GREEN}{cov['overall_score']}% (Target >80% PASS){C_RESET}")
    print(f"Total Test Cases       : {cov['total']}")
    print(f"Positive Scenarios     : {C_GREEN}{cov['positive']}{C_RESET}")
    print(f"Negative Scenarios     : {C_YELLOW}{cov['negative']}{C_RESET}")
    print(f"Edge & Boundary Cases  : {C_MAGENTA}{cov['edge_cases']}{C_RESET}")
    print(f"Security & Performance : {cov['security']} security, {cov['performance']} performance")

    # Stated assumptions
    if result.get("analysis", {}).get("assumptions"):
        print(f"\n{C_BOLD}{C_BLUE}--- Stated Assumptions ({len(result['analysis']['assumptions'])}) ---{C_RESET}")
        for a in result["analysis"]["assumptions"]:
            print(f"  • {a}")

    if result.get("analysis", {}).get("missing_information"):
        print(f"\n{C_BOLD}{C_YELLOW}--- Missing Information Identified ({len(result['analysis']['missing_information'])}) ---{C_RESET}")
        for m in result["analysis"]["missing_information"]:
            print(f"  ⚠ {m}")

    # Test cases list
    print(f"\n{C_BOLD}=== STRUCTURED TEST CASES ({len(result['test_cases'])}) ==={C_RESET}")
    for tc in result["test_cases"]:
        prio_color = C_RED if tc["priority"] == "High" else C_YELLOW if tc["priority"] == "Medium" else C_DIM
        cat_color = C_GREEN if tc["category"] == "Positive" else C_YELLOW

        print(f"\n{C_BOLD}{C_CYAN}[{tc['id']}]{C_RESET} {C_BOLD}{tc['title']}{C_RESET}")
        print(f"  {prio_color}Priority: {tc['priority']}{C_RESET} | Type: {tc['test_type']} | Category: {cat_color}{tc['category']}{C_RESET} | Status: {tc['status']}")
        print(f"  {C_DIM}Preconditions:{C_RESET} {', '.join(tc['preconditions'])}")
        print(f"  {C_DIM}Test Data:{C_RESET}     {', '.join(tc['test_data'])}")
        print(f"  {C_DIM}Steps:{C_RESET}")
        for s in tc["steps"]:
            print(f"    {s}")
        print(f"  {C_BOLD}{C_GREEN}Expected Result:{C_RESET} {tc['expected_result']}")

    # Export
    if args.export == "json":
        out_file = args.out or f"TestGen_{result['id']}.json"
        with open(out_file, "w") as f:
            json.dump(result, f, indent=2)
        print(f"\n{C_GREEN}✓ Exported JSON to: {out_file}{C_RESET}")
    elif args.export == "csv":
        out_file = args.out or f"TestGen_{result['id']}.csv"
        import csv
        with open(out_file, "w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["ID", "Title", "Priority", "Type", "Category", "Steps", "Expected Result"])
            for tc in result["test_cases"]:
                writer.writerow([tc["id"], tc["title"], tc["priority"], tc["test_type"], tc["category"], " | ".join(tc["steps"]), tc["expected_result"]])
        print(f"\n{C_GREEN}✓ Exported CSV to: {out_file}{C_RESET}")

    print(f"\n{C_DIM}Done! TestGen AI Python CLI finished.{C_RESET}\n")

if __name__ == "__main__":
    main()
