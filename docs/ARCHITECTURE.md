# Suarez AI Audit — Architecture

## Overview

Suarez AI Audit is a modular enterprise auditing and risk-management platform.

## Architecture

    Browser
       |
       v
    React + TypeScript
       |
       v
    Application Services
       |
       +-- Audit
       +-- Transactions
       +-- Reports
       +-- Governance
       +-- Enterprise Risk
       +-- Consolidation
       |
       v
    Supabase
       |
       +-- PostgreSQL
       +-- Authentication
       +-- Row Level Security
       +-- RPC Functions

## Roles

    admin
    auditor
    viewer

## Transaction Workflow

    pending / flagged
           |
           v
        reviewed
           |
       +---+---+
       |       |
       v       v
    approved rejected
       |       |
       +---+---+
           |
           v
       Audit Trail

## Delivery

    Developer
       |
       v
    GitHub
       |
       v
    GitHub Actions
       |
       +-- Quality
       +-- Build
       +-- Bundle validation
       +-- Playwright
       |
       v
    Vercel
       |
       v
    Production

## Production

https://suarez-ai-audit.vercel.app
