.PHONY: gcp-build
gcp-build:
	gcloud builds submit \
		--config ./infra/cloud-build.yaml \
		--timeout 30m \
		--ignore-file=./.gcloudignore \
		--project legal-pythia-external \
		--region=europe-west2

.PHONY: initial-gcp-deploy
initial-gcp-deploy:
	gcloud run deploy xai-sound \
		--image=europe-west2-docker.pkg.dev/legal-pythia-external/demos/xai-sound:latest \
		--allow-unauthenticated \
		--description="xAI Sound Demo" \
		--region=europe-west1 \
		--timeout=10m \
		--port 3000 \
		--labels="type=internal,app=xai-sound" \
		--verbosity=info

.PHONY: gcp-deploy
gcp-deploy:
	gcloud run deploy xai-sound \
		--image=europe-west2-docker.pkg.dev/legal-pythia-external/demos/xai-sound:latest \
		--region=europe-west1 \
		--timeout=10m

gcp-build-and-deploy: gcp-build gcp-deploy
