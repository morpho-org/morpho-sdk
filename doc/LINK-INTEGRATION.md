# Link Integration - Local Development Guide

This guide explains how to link this local package to your Next.js application for easier debugging.

## 🚀 Quick Setup

### **Step 1: Initial setup (one time only)**

```bash
# In this morpho-dapp project
pnpm run setup-dev
```

### **Step 2: In your other project**

```bash
# Link the local package
pnpm link morpho-dapp
```

### **Step 3: Daily development**

```bash
# Terminal 2 - Your Next.js
pnpm run dev
```
