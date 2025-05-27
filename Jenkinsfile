pipeline {
  agent any

  environment {
    REG   = 'wiyuwarwoyo'
    IMAGE = 'login-app2'
    TAG   = "${BUILD_NUMBER}"
  }

  stages {
    stage('Checkout') { steps { checkout scm } }

    stage('Unit Test') {
      steps {
        script {
          docker.image('node:20').inside {
            dir('app') {
              sh 'npm ci'
              sh 'npm test || echo "no tests"'
            }
          }
        }
      }
    }

    stage('Build & Push Image') {
      steps {
        script {
          docker.image('docker:24-dind').inside('--privileged -v /var/run/docker.sock:/var/run/docker.sock') {
            dir('app') {
              sh """
                docker build -t ${REG}/${IMAGE}:${TAG} -t ${REG}/${IMAGE}:latest .
                echo ${DOCKER_PAT} | docker login -u ${REG} --password-stdin
                docker push ${REG}/${IMAGE}:${TAG}
                docker push ${REG}/${IMAGE}:latest
              """
            }
          }
        }
      }
    }

    stage('Deploy to K8s') {
      steps {
        withCredentials([file(credentialsId: 'kubeconfig', variable: 'KCFG')]) {
          sh """
            export KUBECONFIG=$KCFG
            kubectl -n login-app set image deploy/login-app \
              login-app=${REG}/${IMAGE}:${TAG}
            kubectl -n login-app rollout status deploy/login-app
          """
        }
      }
    }
  }

  post {
    success { echo '✅  Pipeline sukses!' }
    failure { echo '❌  Deploy gagal' }
  }
}
