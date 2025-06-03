pipeline {
    agent { label 'nodejs-agent' }

    environment {
        DOCKER_IMAGE_TAG = "${env.BRANCH_NAME}-${env.BUILD_NUMBER}"
        DOCKER_IMAGE_TAG_LATEST = "${env.BRANCH_NAME}-latest"
    }

    stages {
        stage('Install npm dependencies') {
            steps {
                cache(defaultBranch: 'dev',
                  maxCacheSize: 2048,
                  caches: [
                    arbitraryFileCache(
                        path: "node_modules",
                        includes: "**/*",
                        cacheValidityDecidingFile: "package-lock.json"
                    )
                  ]) {
                    sh "npm install"
                }
            }
        }

        stage('Run automation tests') {
            steps {
                sh 'npm run test:coverage'
            }
            post {
                always {
                    recordCoverage(tools: [[parser: 'COBERTURA', pattern: '**/cobertura-coverage.xml']])
                    junit allowEmptyResults: true, checksName: 'Unit Tests', stdioRetention: 'FAILED', testResults: 'junit.xml'
                }
            }
        }

        stage('Build and Push Docker Image') {
            agent { label 'docker-agent' }
            when {
                anyOf {
                    branch 'main'
                    branch 'dev'
                    branch 'prod'
                }
            }
            steps {
              withCredentials([string(credentialsId: 'alt-docker-image-name-prefix', variable: 'IMAGE_NAME_PREFIX')]) {
                script {
                  def image = docker.build("${IMAGE_NAME_PREFIX}-api:${DOCKER_IMAGE_TAG}")
                  docker.withRegistry('https://index.docker.io/v1/', 'alt-dockerhub') {
                    image.push()
                    image.push("${DOCKER_IMAGE_TAG_LATEST}")
                  }
                }
              }
            }
        }

        stage('Notify server') {
          when {
            anyOf {
              branch 'main'
              branch 'dev'
              branch 'prod'
            }
          }
          steps {
            withCredentials([
              string(credentialsId: 'alt-server-webhook-secret', variable: 'WEBHOOK_SECRET'),
              string(credentialsId: 'alt-server-webhook-url', variable: 'WEBHOOK_URL')
            ]) {
              sh '''
                PAYLOAD='{}'
                SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" | sed 's/^.* //')

                curl -X POST "$WEBHOOK_URL" \
                  -H "Content-Type: application/json" \
                  -H "X-Hub-Signature: sha256=$SIGNATURE" \
                  -d "$PAYLOAD" \
                  --insecure
              '''
            }
          }
        }
    }
}
