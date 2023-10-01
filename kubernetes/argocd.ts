import * as pulumi from "@pulumi/pulumi";
import * as kubernetes from "@pulumi/kubernetes";
import { eksProvider } from '..'


// Create ArgoCD ns
export function createArgoCD() {
    const argocdns = new kubernetes.core.v1.Namespace("argocd-ns", {
        metadata: { name: "argocd" },
    }, { provider: eksProvider });
    
    
    const argocd = new kubernetes.helm.v3.Release("argocd", {
        chart: "argo-cd",
        namespace: argocdns.metadata.name,
        repositoryOpts: {
            repo: "https://argoproj.github.io/argo-helm",
        },
    }, {
        provider: eksProvider,
    });
}

