ROOT_DIR := $(shell basename $(dir $(realpath $(lastword $(MAKEFILE_LIST)))))
RUST_VERSION := $(shell sed -n 's/^ *channel.*=.*"\([^"]*\)".*/\1/p' rust-toolchain.toml)

install:
	rustup install $(RUST_VERSION)

docker/up:
	docker-compose up -d

docker/clean:
	docker-compose stop
	docker-compose rm -f db
	docker volume rm $(ROOT_DIR)_db

docker/re: docker/clean docker/up

db/up:
	docker-compose up -d db

db/connect: db/up
	docker-compose exec -u postgres db psql marketplace_db

db/update-staging-dump:
	heroku pg:backups:capture --app onlydust-backend-staging-next
	heroku pg:backups:download --app onlydust-backend-staging-next --output ./scripts/fixtures/latest.dump

db/load-fixtures: SHELL:=/bin/bash
db/load-fixtures: db/up
	PGPASSWORD=postgres pg_restore -L <(pg_restore -l ./scripts/fixtures/latest.dump | grep -Ev 'auth migrations|SCHEMA - auth') --clean --no-owner -h localhost -U postgres -d marketplace_db ./scripts/fixtures/latest.dump
	@echo ""
	@echo "Dump loaded ✅"
	@echo ""
	@echo "It was generated on the `GIT_PAGER=cat git log -1 --format=%cd ./scripts/fixtures/latest.dump`"
	@echo "To have a fresh dump, you can use db/update-staging-dump"

migration/run: db/up
	diesel migration run

api/start: docker/up migration/run
	cargo run

hasura/start:
	yarn --cwd ./hasura start

hasura/clean: migration/run
	docker-compose exec -u postgres db psql marketplace_db -c "DELETE FROM hdb_catalog.hdb_metadata"
	yarn --cwd ./hasura hasura md apply
	yarn --cwd ./hasura hasura md ic drop
	yarn --cwd ./hasura hasura md export

cypress/test:
	yarn --cwd ./testing cypress:run

.PHONY: install docker/up docker/clean docker/re db/up db/connect db/update-staging-dump db/load-fixtures migration/run api/start hasura/start hasura/clean cypress/test
