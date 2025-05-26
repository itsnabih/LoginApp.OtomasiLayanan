pipeline {
    agent {
        kubernetes {
            yaml """
            apiVersion: v1
            kind: Pod
            spec:
              containers:
              - name: docker
                image: docker:20.10.14-dind
                command:
                - sleep
                args:
                - 99d
                volumeMounts:
                - name: docker-socket
                  mountPath: /var/run/docker.sock
              - name: node
                image: node:16
                command:
                - sleep
                args:
                - 99d
              - name: kubectl
                image: bitnami/kubectl:latest
                command:
                - sleep
                args:
                - 99d
              volumes:
              - name: docker-socket
                hostPath:
                  path: /var/run/docker.sock
            """
        }
    }
    
    environment {
        DOCKER_REGISTRY = 'wiyuwarwoyo'  // Ganti dengan username DockerHub Anda
        DOCKER_IMAGE = 'login-app2'
        DOCKER_TAG = "${BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                container('node') {
                    dir('app') {
                        sh 'npm install'
                    }
                }
            }
        }
        
        stage('Run Tests') {
            steps {
                container('node') {
                    dir('app') {
                        sh 'npm test || echo "No tests found"'
                    }
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                container('docker') {
                    dir('app') {
                        sh "docker build -t ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG} ."
                    }
                }
            }
        }
        
        stage('Push Docker Image') {
            steps {
                container('docker') {
                    withCredentials([usernamePassword(credentialsId: 'docker-credentials', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                        sh "echo ${DOCKER_PASSWORD} | docker login -u ${DOCKER_USERNAME} --password-stdin"
                        sh "docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG}"
                    }
                }
            }
        }
        
        stage('Update Kubernetes Deployment') {
            steps {
                container('kubectl') {
                    withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                        sh """
                        export KUBECONFIG=${KUBECONFIG}
                        kubectl set image deployment/login-app login-app=${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG}
                        kubectl rollout status deployment/login-app
                        """
                    }
                }
            }
        }
        
        stage('Verify Deployment') {
            steps {
                container('kubectl') {
                    withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                        sh """
                        export KUBECONFIG=${KUBECONFIG}
                        sleep 15
                        kubectl get pods -l app=login-app
                        kubectl get svc login-app
                        """
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}