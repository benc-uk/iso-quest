# Common variables
VERSION := 0.0.1
BUILD_INFO := Manual build 

# Things you don't want to change
REPO_DIR := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))

.PHONY: help image push build run lint lint-fix
.DEFAULT_GOAL := help

help: ## 💬 This help message :)
	@figlet $@ || true
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

lint: ## 🔍 Lint & format check only, sets exit code on error for CI
	@figlet $@ || true
	golangci-lint run 

lint-fix: ## 📝 Lint & format, attempts to fix errors & modify code
	@figlet $@ || true
	golangci-lint run --fix

build: ## 🔨 Run a local build without a container
	@figlet $@ || true
	@echo "Not implemented yet!"
	go build -o ./bin/game 

run: ## 🏃 Run application, used for local development
	@figlet $@ || true
	air -c .air.toml
