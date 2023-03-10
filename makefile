SRC_DIR := "./src"

# Things you don't want to change
REPO_DIR := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))

# Tools
BS_PATH := $(REPO_DIR)/bin/node_modules/.bin/browser-sync
PR_PATH := $(REPO_DIR)/bin/node_modules/.bin/prettier
ESL_PATH := $(REPO_DIR)/bin/node_modules/.bin/eslint
JSDOC_PATH := $(REPO_DIR)/bin/node_modules/.bin/jsdoc

.PHONY: help install-tools local-server lint lint-fix docs
.DEFAULT_GOAL := help

help: ## 💬 This help message :)
	@figlet $@ || true
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install-tools: ## 🔮 Install dev tools into project bin directory
	@figlet $@ || true
	@$(BS_PATH) --version > /dev/null 2>&1 || npm install --prefix ./bin browser-sync
	@$(PR_PATH) -v > /dev/null 2>&1 || npm install --prefix ./bin prettier
	@$(ESL_PATH) -v > /dev/null 2>&1 || npm install --prefix ./bin eslint
	@$(JSDOC_PATH) -v > /dev/null 2>&1 || npm install --prefix ./bin jsdoc
	npm install --prefix ./bin eslint-plugin-jsdoc@latest 

lint: ## 🌟 Lint & format check only, sets exit code on error
	@figlet $@ || true
	@$(PR_PATH) $(SRC_DIR) --check
	@$(ESL_PATH) --resolve-plugins-relative-to ./bin --max-warnings 0 $(SRC_DIR)/**

lint-fix: ## 📝 Lint & format, attempts to fix errors & modify code
	@figlet $@ || true
	@$(ESL_PATH) --resolve-plugins-relative-to ./bin $(SRC_DIR)/** --fix
	@$(PR_PATH) $(SRC_DIR) --write

local-server: ## 🌐 Start a local HTTP server for development
	@figlet $@ || true
	@$(BS_PATH) start --config etc/bs-config.js

docs: ## 📚 Generate documentation
	@figlet $@ || true
	@$(JSDOC_PATH) -c .jsdoc.json -d docs