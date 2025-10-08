.PHONY: gcp-deploy
gcp-deploy:
	gcloud run deploy xai-sound-demo \
		--source . \
		--allow-unauthenticated \
		--description="XAI Sound Demo" \
		--region=europe-west1 \
		--timeout=10m \
		--labels="type=internal,app=demos-xai-sound"
