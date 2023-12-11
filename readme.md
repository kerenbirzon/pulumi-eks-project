# AWS LZCZ Operation Guide

# AWS Organization Management:

You can configure supported AWS services to perform actions in your organization. A service for which you enable trusted access can retrieve information about the accounts, root, OUs, and policies for your organization. [Services that work with Organizations](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_integrate_services_list.html)

The following diagram shows a basic organization that consists of five accounts that are organized into four organizational units (OUs) under the root. The organization also has several policies that are attached to some of the OUs or directly to accounts. For a description of each of these items, refer to the definitions in this topic.

[AWS ORganization digram](https://docs.aws.amazon.com/images/organizations/latest/userguide/images/AccountOuDiagram.png)

## Terminology and Concepts

Organization - An entity that you create to consolidate your AWS [accounts](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_getting-started_concepts.html#account) so that you can administer them as a single unit. You can use the [AWS Organizations console](https://console.aws.amazon.com/organizations/) to centrally view and manage all of your accounts within your organization. An organization has one management account along with zero or more member accounts. You can organize the accounts in a hierarchical, tree-like structure with a [root](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_getting-started_concepts.html#root) at the top and [organizational units](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_getting-started_concepts.html#organizationalunit) nested under the root. Each account can be directly in the root or placed in one of the OUs in the hierarchy. An organization has functionality that is determined by the [feature set](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_getting-started_concepts.html#feature-set) that you enable.

Root - The parent container for all the accounts for your organization. If you apply a policy to the root, it applies to all [organizational units (OUs)](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_getting-started_concepts.html#organizationalunit) and [accounts](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_getting-started_concepts.html#account) in the organization.

An organizational unit (OU) - A container for [accounts](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_getting-started_concepts.html#account) within a [root](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_getting-started_concepts.html#root). An OU also can contain other OUs, enabling you to create a hierarchy that resembles an upside-down tree, with a root at the top and branches of OUs that reach down, ending in accounts that are the leaves of the tree. When you attach a policy to one of the nodes in the hierarchy, it flows down and affects all the branches (OUs) and leaves (accounts) beneath it. An OU can have exactly one parent, and currently each account can be a member of exactly one OU.

Account - An account in Organizations is a standard AWS account that contains your AWS resources and the identities that can access those resources.

There are two types of accounts in an organization: a single account that is designated as the management account, and one or more member accounts:

1. The management account is the account that you use to create the organization. From the organization's management account, you can do the following:
    ◦ Create accounts in the organization
    ◦ Invite other existing accounts to the organization
    ◦ Remove accounts from the organization
    ◦ Manage invitations
    ◦ Apply policies to entities (roots, OUs, or accounts) within the organization
    ◦ Enable integration with supported AWS services to provide service functionality across all of the accounts in the organization.
The management account has the responsibilities of a *payer account* and is responsible for paying all charges that are accrued by the member accounts. You can't change an organization's management account.
2. Member accounts make up all of the rest of the accounts in an organization. An account can be a member of only one organization at a time. You can attach a policy to an account to apply controls to only that one account.

# Configuration Files Structure:

```
├── env
│   ├── dev
│   │   ├── config.yaml
│   │   └── manifest.yaml
│   └── prod
│       ├── config.yaml
│       └── manifest.yaml
```

## config.yaml – Deployment settings

The config.yaml file contains the basic configuration of your LZ such as:

> aws:
> 
- primary_region - Configuration of the main region
- regions              - Config of regions and availability zones

> terraform:
> 
- state_bucket - S3 bucket name with terraform [state](https://developer.hashicorp.com/terraform/language/state)
- lock_table      - DynamoDB table name with state lock configuration
- version           - Version of terraform
- providers       - Configured providers and their versions

> env:
> 
- excluded_accounts                - List of accounts that will be blacklisted in Terraform and Terragrunt state and will not be in use.
- management_account           - Payer account ID
- audit_account                         - Audit account ID
- integration_account               - Integration account ID
- master_integration_account - Main integration account ID (in case your environment has multiple account configurations, in normal circumstances, `master_integration_account` should be equal to `integration_account`)
- log_archive_account              - Log archive account ID
- tags: A remark that the resource was created with Terraform by CloudZone.

## manifest.yaml – Configuration of Landing Zone

The manifest file is a YAML-formatted text file, containing the configuration of the Landing Zone.

```yaml
organization:
  password_policy:
    minimum_password_length: 14
    require_lowercase_characters: true
    require_numbers: true
    require_uppercase_characters: true
    require_symbols: true
    allow_users_to_change_password: true
    max_password_age: 90
    password_reuse_prevention: 6
  conformance_packs:
    Operational-Best-Practices-for-CIS:
      input_parameters:
        - name: AccessKeysRotatedParamMaxAccessKeyAge
          value: 30
      excluded_accounts:
        - Audit
  config:
    rules:
      IAM_ROOT_ACCESS_KEY_CHECK:
        frequency: TwentyFour_Hours
      ROOT_ACCOUNT_MFA_ENABLED:
        frequency: TwentyFour_Hours
      ACCESS_KEYS_ROTATED:
        params:
          maxAccessKeyAge: "90"
      RDS_STORAGE_ENCRYPTED:
      RDS_INSTANCE_PUBLIC_ACCESS_CHECK:
  controls:
    - AWS-GR_AUDIT_BUCKET_ENCRYPTION_ENABLED
    - XLSIRLRDKWVQ # Name - [CT.CLOUDFORMATION.PR.1] Disallow management of resource types, modules, and hooks within the AWS CloudFormation registry
  account_vending_machine:
    close_account_on_delete: false
    deleted_ou: DELETED
  security_hub:
    enabled: true
    pci_dss_standard: true
    cis_standard: true
    aws_foundational_standard: true
    custom_packages:
  guardduty:
    enabled: true
    accounts_auto_enable: true
    detector_s3_logs_protection: false
    kubernetes_audit_logs: false
  scp:
    - prevent_access_aws_marketplace
    - prevent_create_iam_access_keys
    - prevent_create_internet_resources
    - prevent_delete_objects_s3
    - prevent_disabling_cloudtrail
    - prevent_disabling_security_hub
    - prevent_leaving_organization
    - prevent_modify_guardduty
    - prevent_s3_public_access_change
  ous:
    DELETED:
      display_name: "DELETED"
      parent: null
      level: 0
      is_isolated: false
      scp:
      stackset:
      accounts:
    HUB_SPOKE:
      display_name: "HUB_SPOKE"
      parent: null
      level: 0
      is_isolated: false
      scp:
      stackset:
			controls:
        - BHMRGDCOJVNB # Name - [CT.ELASTICFILESYSYSTEM.PR.1] Require an Amazon EFS file system to encrypt file data at rest using AWS KMS
      accounts:
        lzcz-hub:
            SSOUserEmail: mail@company.com
            AccountEmail: lzcz-hub@company.com
            SSOUserLastName: FName
            SSOUserFirstName: LName
            budget_limit: "150"
            budget_threshold: "70"
            budget_notification_email_addresses:
              - mail@company.com
            workloads:
              networking-eu-west-1:
                blueprint: networking
                region: eu-west-1
                hub:
                  vpc_egress_cidr: 10.65.0.0/22
                  east_west_vpc_cidr: 10.66.0.0/22
                  vpc_ingress_cidr: 10.67.0.0/22
                  flow_logs_retention:  90
                  east_west_subnets_bits: 4
                  subnets_ingress_bits: 4 
                  subnets_egress_bits: 4
                  centralized_vpc_flow_log_enable: true
                  unified_networking: true
                  firewall_appliance: # Please choose one of the options: AWSNetworkFirewall or ApplianceFirewall or null
                  east_west_appliance: true
                  egress_appliance:  true 
                  ingress_appliance: true
                  ingress_waf_subnets_enable: false
                  tgw_asn: "64522"
        lzcz-spoke:
            SSOUserEmail: mail@company.com
            AccountEmail: lzcz-spoke@company.com
            SSOUserLastName: FName
            SSOUserFirstName: LName
            budget_limit: "150"
            budget_threshold: "70"
            budget_notification_email_addresses:
              - mail@company.com
            workloads:
              initial-eu-west-1:
                blueprint: initial
                vpc_cidr: 10.85.0.0/16
                subnets_bits : 4
                region: eu-west-1
              initial-us-east-1:
                blueprint: initial
                vpc_cidr: 100.10.0.0/16
                subnets_bits : 4
                region: us-east-1
```

The file contains information about desired Organization structure, OUs baseline policies, and configuration parameters for the deployment.
Attribute references 

### Manifest sections:

> password_policy - Contain a password policy on the AWS account in order to specify complexity requirements and mandatory rotation periods for IAM users passwords.
> 

> conformance_packs - Contain the objects with names of conformance packs, that will be attached to the Organization. The names should correspond to filenames in assets/conformance_packs dir
> 

> config - Should contain a list of AWS Config rules that you can use to manage resources in the organization
> 

> controls - List of enabled control towers controls on the Organization lvl
> 

> account_vending_machine – The section of vending machine configuration
> 
- close_account_on_delete - Closes AWS account upon de-provision. The feature is under development, so the account is not deleted, just moved into DELETED OU.
- deleted_ou                          - Name of OU for de-provisioned accounts (By default named - DELETED)

> security_hub – The section for security hub service configuration
> 
- enabled                                     - Enables/disables the security hub deployment. The option could be true or false
- pci_dss_standard                    - Enables/disables pci_dss_standard deployment. The option could be true or false
- cis_standard                              - Enables/disables cis_standard deployment. The option could be true or false
- aws_foundational_standard   - Enables/disables aws_foundational_standard deployment. The option could be true or false.
- custom_packages                    - List of ARNs for Security Hub products deployment. (see [https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-partner-providers.html](https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-partner-providers.html) for details)

> guardduty - The section for GuardDuty service configuration
> 
- enabled                                     - Enables/disables the guard duty deployment. The option could be true or false
- accounts_auto_enable            - By default true, Automating the addition of new organization accounts as members. The option could be true or false.
- detector_s3_logs_protection - By default false, enables Amazon GuardDuty to monitor object-level API operations to identify potential security risks for data within your S3 buckets. The option could be true or false.
- [kubernetes_audit_logs](https://docs.aws.amazon.com/guardduty/latest/ug/guardduty_finding-types-kubernetes.html)            - By default false, the following findings are specific to Kubernetes resources and have a resource_type of EKSCluster. The option could be true or false.

> scp - Contain a type of organizational policies that you can use to manage permissions in your organization.
> 

> ous - Organization Units
> 
- ou_name         - Unique identifier of OU across the configuration.
- display_name - Sets the display name of the OU. Can be used for several OUs simultaneously
- parent              - The link to parent OU. Should be null if the OU is on the top level of the hierarchy, otherwise should contain ou_name.
- level                  - The level of the OU in the organization hierarchy. The top level is 0, the lowest is 4.
- is_isolated      - Should be true if the OU should get a separate network for all its accounts 
- scp                   - Contain the list with names of SCPs that will be attached to the OU. The names should correspond to filenames in assets/scp_templates dir
- stackset          - Contain the list with names of stacksets that will be attached to the OU. The names should correspond to filenames in assets/stacksets dir

> accounts - Contain the list of account objects
> 
- account_name                                          - Unique identifier of the account
- SSOUserEmail                                           - The e-mail of the SSO user, that will get Administrator privileges to the account
- AccountEmail                                            - The unique e-mail for the root user
- SSOUserLastName                                  - The surname of the user
- SSOUserFirstName                                  - The name of the user
- budget_limit: "150"                                  - The budget limit
- budget_threshold                                     - Notification threshold. Once an account reaches the spend of the threshold value (in %), the notification will be sent
- budget_notification_email_addresses   - The list of users that will get budget alerts

> workloads - Contain the list of workload objects under the account
> 
- Unique name of the Workload
- blueprint         - Workload blueprint section, should: initial/shared_services/networking
- vpc_cidr         - The CIDR block for the workload
- subnets_bits  - The number of additional bits with which to extend the prefix
- region             - The region where workload will be configured

# OU Management:

An organizational unit (OU) is a logical grouping of accounts in your organization, created using AWS Organizations.

## Create OU

1. Navigate to `LZCZ-Core/env/{Your_ENV}/manifest.yaml` and add OU configuration under `ous` block

```yaml
ous:
	OU-1:
	    display_name: "OU-1"
	  parent: null
	  level: 0
	  is_isolated: false
	  scp:
	  stackset:
	  controls:
		accounts:
		    ACC-1-PROD:
		      SSOUserEmail: ACC-1-PROD@company.co
		      AccountEmail: ACC-1-PROD@company.co
		      SSOUserLastName: Admin
		      SSOUserFirstName: AWS Control Tower
		      vpc_cidr: 10.85.48.0/20
		      subnets_bits: 4
		      budget_limit: "150"
		      budget_threshold: "70"
		      budget_notification_email_addresses:
		        - ACC-1-budget@company.co
					workloads:
	OU-2:
		 display_name: "OU-2"
		 parent: null
		 level: 0
		 is_isolated: false
		 scp:
		 stackset:
		 accounts:
		    OU-2-DEV:
		      SSOUserEmail: OU-2@company.co
		      AccountEmail: OU-2@company.co
		      SSOUserLastName: Admin
		      SSOUserFirstName: AWS Control Tower
		      vpc_cidr: 10.86.64.0/20
		      subnets_bits: 4
		      budget_limit: "150"
		      budget_threshold: "70"
		      budget_notification_email_addresses:
		        - OU-2-budget@company.co
		      workloads:
							
```

2. Push the updates to the repo and wait till the end of push


💡 The new OU creation will result in a manual approval step during the pipeline run



## Delete OU

In order to remove OU: 

1. Make sure to remove all accounts from the target OU before deletion
2. Navigate to `LZCZ-Core/env/{Your_ENV}/manifest.yaml`
3. First full comment/delete the account that is configured under the requested OU:
    
    ```yaml
    # Removing example via comment
    ous:
    	OU-1:
    	    display_name: "OU-1"
    	  parent: null
    	  level: 0
    	  is_isolated: false
    	  scp:
    	  stackset:
    	  controls:
    		accounts:
    	    ACC-1-PROD:
    	      SSOUserEmail: ACC-1-PROD@company.co
    	      AccountEmail: ACC-1-PROD@company.co
    	      SSOUserLastName: Admin
    	      SSOUserFirstName: AWS Control Tower
    	      vpc_cidr: 10.85.48.0/20
    	      subnets_bits: 4
    	      budget_limit: "150"
    	      budget_threshold: "70"
    	      budget_notification_email_addresses:
    	        - ACC-1-budget@company.co
    				workloads:
    	OU-2:
    		 display_name: "OU-2"
    		 parent: null
    		 level: 0
    		 is_isolated: false
    		 scp:
    		 stackset:
    		 accounts:
    		#    OU-2-DEV:
    		#      SSOUserEmail: OU-2@company.co
    		#      AccountEmail: OU-2@company.co
    		#      SSOUserLastName: Admin
    		#      SSOUserFirstName: AWS Control Tower
    		#      vpc_cidr: 10.86.64.0/20
    		#      subnets_bits: 4
    		#      budget_limit: "150"
    		#      budget_threshold: "70"
    		#      budget_notification_email_addresses:
    		#        - OU-2-budget@company.co
    		#      workloads:
    ```
    
4. Push the updates to the repo and wait till the end of push
5. Comment/delete the requested OU and push update to the repo

```yaml
# Removing example via comment
ous:
	OU-1:
	    display_name: "OU-1"
	  parent: null
	  level: 0
	  is_isolated: false
	  scp:
	  stackset:
	  controls:
		accounts:
	    ACC-1-PROD:
	      SSOUserEmail: ACC-1-PROD@company.co
	      AccountEmail: ACC-1-PROD@company.co
	      SSOUserLastName: Admin
	      SSOUserFirstName: AWS Control Tower
	      vpc_cidr: 10.85.48.0/20
	      subnets_bits: 4
	      budget_limit: "150"
	      budget_threshold: "70"
	      budget_notification_email_addresses:
	        - ACC-1-budget@company.co
				workloads:
	# OU-2:
		# display_name: "OU-2"
		# parent: null
		# level: 0
		# is_isolated: false
		# scp:
		# stackset:
		# accounts:
		#    OU-2-DEV:
		#      SSOUserEmail: OU-2@company.co
		#      AccountEmail: OU-2@company.co
		#      SSOUserLastName: Admin
		#      SSOUserFirstName: AWS Control Tower
		#      vpc_cidr: 10.86.64.0/20
		#      subnets_bits: 4
		#      budget_limit: "150"
		#      budget_threshold: "70"
		#      budget_notification_email_addresses:
		#        - OU-2-budget@company.co
		#      workloads:
```

2. Push the updates to the repo and wait till the end of push

## Create Workload

1. Navigate to `LZCZ-Core/env/{Your_ENV}/manifest.yaml` 

```yaml
OU-1:
      display_name: "OU-1"
      parent: null
      level: 0
      is_isolated: false
      scp:
      stackset:
      controls:
			accounts:
        ACC-1-PROD:
          SSOUserEmail: ACC-1-PROD@company.co
          AccountEmail: ACC-1-PROD@company.co
          SSOUserLastName: Admin
          SSOUserFirstName: AWS Control Tower
          vpc_cidr: 10.85.48.0/20
          subnets_bits: 4
          budget_limit: "150"
          budget_threshold: "70"
          budget_notification_email_addresses:
            - ACC-1-budget@company.co
					workloads:
              initial-eu-west-1:
                blueprint: initial
                vpc_cidr: 10.85.0.0/16
                subnets_bits : 4
                region: eu-west-1
              initial-us-east-1:
                blueprint: initial
                vpc_cidr: 100.10.0.0/16
                subnets_bits : 4
                region: us-east-1
```

2. Push the updates to the repo and wait till the end of push

## Delete Workload

1. Navigate to `LZCZ-Core/env/{Your_ENV}/manifest.yaml` and add Workload configuration in required OU under `accounts` block
2. Comment/delete required workload:

```yaml
OU-1:
      display_name: "OU-1"
      parent: null
      level: 0
      is_isolated: false
      scp:
      stackset:
      controls:
			accounts:
        ACC-1-PROD:
          SSOUserEmail: ACC-1-PROD@company.co
          AccountEmail: ACC-1-PROD@company.co
          SSOUserLastName: Admin
          SSOUserFirstName: AWS Control Tower
          vpc_cidr: 10.85.48.0/20
          subnets_bits: 4
          budget_limit: "150"
          budget_threshold: "70"
          budget_notification_email_addresses:
            - ACC-1-budget@company.co
					workloads:
              # initial-eu-west-1:
              #  blueprint: initial
              #  vpc_cidr: 10.85.0.0/16
              #  subnets_bits : 4
              #  region: eu-west-1
              # initial-us-east-1:
              #  blueprint: initial
              #  vpc_cidr: 100.10.0.0/16
              #  subnets_bits : 4
              #  region: us-east-1
```

3. Push the updates to the repo and wait till the end of push

# Accounts Management:

## Create Hub and Spoke Accounts example

1. Navigate to `LZCZ-Core/env/{Your_ENV}/manifest.yaml` and add hub and spoke configuration (include workload configuration) under `accounts` block on the required OU

```yaml
ous:
    HUB_SPOKE:
      display_name: "HUB_SPOKE"
      parent: null
      level: 0
      is_isolated: false
      scp:
      stackset:
			controls:
      accounts:
        lzcz-hub:
            SSOUserEmail: mail@company.com
            AccountEmail: lzcz-hub@company.com
            SSOUserLastName: FName
            SSOUserFirstName: LName
            budget_limit: "150"
            budget_threshold: "70"
            budget_notification_email_addresses:
              - mail@company.com
            workloads:
              networking-eu-west-1:
                blueprint: networking
                region: eu-west-1
                hub:
                  vpc_egress_cidr: 10.65.0.0/22
                  east_west_vpc_cidr: 10.66.0.0/22
                  vpc_ingress_cidr: 10.67.0.0/22
                  flow_logs_retention:  90
                  east_west_subnets_bits: 4
                  subnets_ingress_bits: 4 
                  subnets_egress_bits: 4
                  centralized_vpc_flow_log_enable: true
                  unified_networking: true
                  firewall_appliance: # Please choose one of the options: AWSNetworkFirewall or ApplianceFirewall or null
                  east_west_appliance: true
                  egress_appliance:  true 
                  ingress_appliance: true
                  ingress_waf_subnets_enable: false
                  tgw_asn: "64521"
        lzcz-spoke:
            SSOUserEmail: mail@company.com
            AccountEmail: lzcz-spoke@company.com
            SSOUserLastName: FName
            SSOUserFirstName: LName
            budget_limit: "150"
            budget_threshold: "70"
            budget_notification_email_addresses:
              - mail@company.com
            workloads:
              initial-eu-west-1:
                blueprint: initial
                vpc_cidr: 10.85.0.0/16
                subnets_bits : 4
                region: eu-west-1
              initial-us-east-1:
                blueprint: initial
                vpc_cidr: 100.10.0.0/16
                subnets_bits : 4
                region: us-east-1
```

2. Push the updates to the repo and wait till the end of push

## Delete Hub Account

1. Before the deletion of the Hub accounts, please must delete all the spokes that are using the Hub
2. Navigate to `LZCZ-Core/env/{Your_ENV}/manifest.yaml`
3. Comment or remove the HUB account workload configuration from the `account's` block
    
    ```yaml
    # Removing example via comment
    ous:
        HUB_SPOKE:
          display_name: "HUB_SPOKE"
          parent: null
          level: 0
          is_isolated: false
          scp:
          stackset:
    			controls:
          accounts:
            lzcz-hub:
                SSOUserEmail: mail@company.com
                AccountEmail: lzcz-hub@company.com
                SSOUserLastName: FName
                SSOUserFirstName: LName
                budget_limit: "150"
                budget_threshold: "70"
                budget_notification_email_addresses:
                  - mail@company.com
                workloads:
                  # networking-eu-west-1:
                    # blueprint: networking
                    # region: eu-west-1
                    # hub:
                      # vpc_egress_cidr: 10.65.0.0/22
                      # east_west_vpc_cidr: 10.66.0.0/22
                      # vpc_ingress_cidr: 10.67.0.0/22
                      # flow_logs_retention:  90
                      # east_west_subnets_bits: 4
                      # subnets_ingress_bits: 4 
                      # subnets_egress_bits: 4
                      # centralized_vpc_flow_log_enable: true
                      # unified_networking: true
                      # firewall_appliance: # Please choose one of the options: AWSNetworkFirewall or ApplianceFirewall or null
                      # east_west_appliance: true
                      # egress_appliance:  true 
                      # ingress_appliance: true
                      # ingress_waf_subnets_enable: false
                      # tgw_asn: "64522"
    ```
    
4. Push the updates to the repo and wait till the end of push
5. Comment or remove the HUB account configuration from the `account's` block

```yaml
# Removing example via comment
ous:
    HUB_SPOKE:
      display_name: "HUB_SPOKE"
      parent: null
      level: 0
      is_isolated: false
      scp:
      stackset:
			controls:
      accounts:
        # lzcz-hub:
            # SSOUserEmail: mail@company.com
            # AccountEmail: lzcz-hub@company.com
            # SSOUserLastName: FName
            # SSOUserFirstName: LName
            # budget_limit: "150"
            # budget_threshold: "70"
            # budget_notification_email_addresses:
            #  - mail@company.com
            # workloads:
```

6. Push the updates to the repo and wait till the end of push

## Create Shared Services Account

1. Navigate to `LZCZ-Core/env/{Your_ENV}/manifest.yaml` and add account configuration under `accounts` block

Please pay attention that only HUB (Networking account) does not require these configurations: `vpc_cidr`, `subnets_bits`

```yaml
ous:
    Example-OU:
      display_name: "Example-OU"
      parent: null
      level: 0
      is_isolated: false
      scp:
      stackset:
      controls:
      accounts:                                       ###<---------------
        Shared_Services:
           SSOUserEmail: Shared_Services@company.co
           AccountEmail: Shared_Services@company.co
           SSOUserLastName: Admin
           SSOUserFirstName: AWS Control Tower
           vpc_cidr: 10.86.64.0/20
           subnets_bits: 4
           budget_limit: "150"
           budget_threshold: "70"
           budget_notification_email_addresses:
             - Shared_Services-budget@company.co
          workloads:
              shared-services-eu-west-1:
                blueprint: shared_services
                region: eu-west-1
                shared-services:
                  shared_vpc_cidr: 10.89.0.0/16
                  shared_vpc_subnets_bits: 4
                  hosted_zones: hz1|hz2
                  customer_domain_names: d1.local|d2.local|d3.local
                  resolvers_target_ips: 1.1.1.1|1.0.0.1
                  interface_endpoints: #s3|sqs|dynamodb
                  gateway_endpoints: #s3|sqs|dynamodb
```

2. Push the updates to the repo and wait till the end of push

### Shared account sections

shared_vpc_cidr – The CIDR block for the Shared Services VPC
shared_vpc_subnets_bits – The number of additional bits with which to extend the prefix
hosted_zones – A list of Private domains to create on the shared services account
customer_domain_names – Customer domains for outbound and inbound resolver endpoints
resolvers_target_ips – IP addresses of the DNS resolvers on your remote network
resolvers_dns_query_port – The ports that the resolvers use for DNS queries on your remote network
interface_endpoints - The list of interface vpc endpoints to deploy
gateway_endpoints – The list of gateway vpc endpoints to deploy

## Delete Shared Services Account

1. Before the deletion of the Shared services accounts, please must delete all the spokes that are using the Hub
2. Navigate to `LZCZ-Core/env/{Your_ENV}/manifest.yaml`
3. Comment or remove the Shared Services account configuration from the `account's` block

```yaml
# Removing example via comment
  Example-OU:
      display_name: "Example-OU"
      parent: null
      level: 0
      is_isolated: false
      scp:
      stackset:
      accounts:
     #   Shared_Services:
     #      SSOUserEmail: Shared_Services@company.co
     #      AccountEmail: Shared_Services@company.co
     #      SSOUserLastName: Admin
     #      SSOUserFirstName: AWS Control Tower
     #      vpc_cidr: 10.86.64.0/20
     #      subnets_bits: 4
     #      budget_limit: "150"
     #      budget_threshold: "70"
     #      budget_notification_email_addresses:
     #        - Shared_Services-budget@company.co
```

4. Push the updates to the repo and wait till the end of push

## Good to know

Once you configure an empty value in the parameter, terragrunt knows to read it and doesn't create anything

Empty example:

```yaml
hosted_zones:
customer_domain_names:
resolvers_target_ips:
resolvers_dns_query_port:

```

Filled example:

```yaml
hosted_zones: hz1|hz2
customer_domain_names: d1.local|d2.local|d3.local
resolvers_target_ips: 1.1.1.1|1.0.0.1
resolvers_dns_query_port: 53
```

# SCP Management:

Service control policies ([SCPs](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html)) are a type of organizational policy that you can use to manage permissions in your organization. SCPs offer central control over the maximum available permissions for all accounts in your organization.

This example shows which policies have been used in the dev/prod environment in `manifest.yaml` on the organization level

Navigate to `LZCZ-Core/env/{Your_ENV}/manifest.yaml` 

```yaml
organization:
	scp:                                                     
    - prevent_access_aws_marketplace
    - prevent_create_iam_access_keys
    - prevent_create_internet_resources
    - prevent_disabling_cloudtrail
    - prevent_disabling_security_hub
    - prevent_leaving_organization
    - prevent_modify_guardduty
    - prevent_s3_public_access_change
```

## Attach SCP to Organization:

This example shows which policies have been used in the required environment in `manifest.yaml`

1. Navigate to `LZCZ-Core/assets/scp_templates` and create a new YAML file with the required content and name it with the same manner as in the examples below
    
    In this example, you can see the `prevent_delete_objects_s3.json` policy
    

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": [
                "s3:DeleteBucket",
                "s3:DeleteObject",
                "s3:DeleteObjectVersion"
            ],
            "Resource": "*",
            "Effect": "Deny"
        }
    ]
}
```

2. Navigate to /LZCZ-Core/env/{Your_ENV}/manifest.yaml, and add the name of a new policy to the list 

```yaml
scp:                                                     
  - prevent_access_aws_marketplace
  - prevent_create_iam_access_keys
  - prevent_create_internet_resources
  - prevent_disabling_cloudtrail
  - prevent_disabling_security_hub 
  - prevent_leaving_organization
  - prevent_modify_guardduty
  - prevent_s3_public_access_change
  - prevent_delete_objects_s3           ### <----------
```

3. Push the updates to the repo and wait till the end of push

## Attach SCP to OU:

1. Navigate to `LZCZ-Core/env/{Your_ENV}/manifest.yaml`, and add the name of a requested policy under the `ous` block

```yaml
ous:
  Example-OU:
    display_name: "Example-OU"
    parent: null
    level: 0
    is_isolated: false
    stackset:
    accounts:
    scp:
      - Enable_S3_Encryption
      - IAM_Password_Policy
      - Check_IAM_Keys_Rotation
```

## Detach SCP:

Navigate to `LZCZ-Core/env/{Your_ENV}/manifest.yaml`, remove the name of a required policy from the SCP list 


💡 Once you configure an empty value in the parameter, terragrunt knows to read it and doesn't create anything



Empty example:

```yaml
organization:
  conformance_packs:
  account_vending_machine:
    close_account_on_delete: false
    deleted_ou: DELETED_OU
  security_hub:
    enabled: true
    pci_dss_standard: true
    cis_standard: true
    aws_foundational_standard: true
    custom_packages:
  guardduty:
    enabled: true
    accounts_auto_enable: true
    detector_s3_logs_protection: false
    kubernetes_audit_logs: false
  scp:                                   ### <------------------------
  ous:
    DELETED_OU:
      display_name: "DELETED_OU"
      parent: null
      level: 0
      is_isolated: false
      scp:
      stackset:
			controls:
      accounts:

```

Filled example:

```yaml
organization:
   scp:
     - prevent_access_aws_marketplace
     - prevent_create_iam_access_keys
     - prevent_create_internet_resources
     - prevent_delete_objects_s3
     - prevent_disabling_cloudtrail
     - prevent_disabling_security_hub
     - prevent_leaving_organization
     - prevent_modify_guardduty
     - prevent_s3_public_access_change
		ous:
	    Workload:
	      display_name: "Workload"
	      parent: null
	      level: 0
	      is_isolated: false
	      scp:
          - Enable_S3_Encryption
          - IAM_Password_Policy
          - Check_IAM_Keys_Rotation
	      stackset:
	      accounts:
```

# Stackset Management:

You can use StackSets to launch AWS Service Catalog products across multiple AWS Regions and accounts. You can specify the order in which products deploy sequentially within AWS Regions.

This example shows which stacksets have been used in the `manifest.yaml` on the organization unit level

```yaml
    ous:
      Workload:
        display_name: "Workload"
        parent: null
        level: 0
        is_isolated: false
        scp:
        stackset:
         - Check_IAM_Keys_Rotation
         - Check_RDS_Encryption
         - Enable_EBS_Default_Encryption
         - Enable_S3_Encryption
         - IAM_Password_Policy
         - Root_Account_MFA_Enabled_Check
         - S3_Block_Public_Access

```

## Create stackset:

1. Navigate to `LZCZ-Core/assets/stackset_templates` and create a new YAML file with the required content and name it with the same manner as in the examples below
    
    In this example, you can see the `Check_RDS_Public_Access_Disabled.yaml` template
    
    ```yaml
    AWSTemplateFormatVersion: "2010-09-09"
    Description: ""
    Resources:
      ConfigRule:
        Type: "AWS::Config::ConfigRule"
        Properties:
          ConfigRuleName: "rds-instance-public-access-check"
          Scope:
            ComplianceResourceTypes:
              - "AWS::RDS::DBInstance"
          Description: "A config rule that checks whether the Amazon Relational Database Service instances are not publically accessible. The rule is NON_COMPLIANT if the publiclyAccessible field is true in the instance configuration item."
          Source:
            Owner: "AWS"
            SourceIdentifier: "RDS_INSTANCE_PUBLIC_ACCESS_CHECK"
    Parameters: {}
    Metadata: {}
    Conditions: {}
    ```
    
    2. After saving of newly created yaml file, navigate to `LZCZ-Core/env/{Your_ENV}/manifest.yaml`, and add the name of a new template name to the list 
    
    ```yaml
    stackset:
      - Check_IAM_Keys_Rotation
      - Check_RDS_Encryption
      - Enable_EBS_Default_Encryption
      - Enable_S3_Encryption
      - IAM_Password_Policy
      - Root_Account_MFA_Enabled_Check
      - S3_Block_Public_Access
      - Check_RDS_Public_Access_Disabled   ###<------
    ```
    
    3. Push the updates to the repo and wait till the end of push

## Delete Stackset

1. Navigate to `LZCZ-Core/env/{Your_ENV}/manifest.yaml`, and remove the name of a required stackset name from the Stackset list

```yaml
stackset:
  - Check_IAM_Keys_Rotation
  - Check_RDS_Encryption
  - Enable_EBS_Default_Encryption
  - Enable_S3_Encryption
  - Root_Account_MFA_Enabled_Check
  # - IAM_Password_Policy                ###<------
  # - S3_Block_Public_Access             ###<------
  # - Check_RDS_Public_Access_Disabled   ###<------
```

2. Push the updates to the repo and wait till the end of push

# Conformance Pack Management:

A [conformance pack](https://docs.aws.amazon.com/config/latest/developerguide/conformance-packs.html) is a collection of AWS Config rules and remediation actions that can be easily deployed as a single entity in an account and a Region or across an organization in AWS Organizations.

Conformance packs are created by authoring a YAML format that contains the list of AWS Config managed or custom rules and remediation actions. 

Conformance pack configured under `LZCZ-Core/env/{Your_ENV}/manifest.yaml` and by default could be empty

```yaml
# manifest.yaml

organization:
  conformance_packs:                   ### <----
```

## Attach Conformance Pack:

[Here](https://github.com/awslabs/aws-config-rules/tree/master/aws-config-conformance-packs) are the official AWS conformance pack YAML templates that you see in the AWS Config console. Within each conformance pack template, you can use one or more AWS Config rules and remediation actions. 

1. Navigate to LZCZ-Core/env/{Your_ENV}/manifest.yaml and add the conformance pack configuration in the conformance_packs block

Example of Operational Best Practices for CIS config on the organization level:

```yaml
# manifest.yaml

organization:
  conformance_packs:
		Operational-Best-Practices-for-CIS:
	  input_parameters:
	    - name: AccessKeysRotatedParamMaxAccessKeyAge
        value: 30
    excluded_accounts:          
	    - Audit
      - Log Archive
      - Integration
      - {{Management Account Name}}                 
```

2. Push the updates to the repo and wait till the end of push

## Delete Conformance Pack:

1. Navigate to `LZCZ-Core/env/{Your_ENV}/manifest.yaml` and delete or comment on the `conformance_packs` block

```yaml
# manifest.yaml

organization:
  conformance_packs:                   ### <-----
```

2. Push the updates to the repo and wait till the end of push

# AWS Config Rules Management:

An AWS Config rule represents your desired configuration settings for specific AWS resources or for an entire AWS account. If a resource does not pass a rule check, AWS Config flags the resource and the rule as noncompliant

AWS Config configured under `LZCZ-Core/env/{Your_ENV}/manifest.yaml` 

```yaml
organization:
  config:
    rules:
      ROOT_ACCOUNT_MFA_ENABLED:
        frequency: TwentyFour_Hours
      ACCESS_KEYS_ROTATED:
        params:
          maxAccessKeyAge: "90"
      RDS_INSTANCE_PUBLIC_ACCESS_CHECK:
			EC2_NO_AMAZON_KEY_PAIR:

```

## Attach Config Rule:

1. Choose the required rule from AWS official list of managed rules - [https://docs.aws.amazon.com/config/latest/developerguide/managed-rules-by-aws-config.html](https://docs.aws.amazon.com/config/latest/developerguide/managed-rules-by-aws-config.html)
2. Navigate to `LZCZ-Core/env/{Your_ENV}/manifest.yaml` and add `Identifier` full name (if required, with custom configuration) in the required block.
3. In the example bellow we attaching config rule on the organization level

```yaml
organization:
  config:
    rules:
      ROOT_ACCOUNT_MFA_ENABLED:
        frequency: TwentyFour_Hours
      IAM_ROOT_ACCESS_KEY_CHECK:                ### <----------------------------
        frequency: TwentyFour_Hours             ### <----------------------------
      ACCESS_KEYS_ROTATED:
        params:
          maxAccessKeyAge: "90"
      RDS_INSTANCE_PUBLIC_ACCESS_CHECK:
      RDS_STORAGE_ENCRYPTED:                    ### <----------------------------

```

4. Push the updates to the repo and wait till the end of push

## Detach Config Rule:

1. Navigate to `LZCZ-Core/env/{Your_ENV}/manifest.yaml` and remove/comment `Identifier` name in the required block

```yaml
# Removing example via comment
organization:
  config:
    rules:
      ROOT_ACCOUNT_MFA_ENABLED:
        frequency: TwentyFour_Hours
      IAM_ROOT_ACCESS_KEY_CHECK:                
	      frequency: TwentyFour_Hours             
      ACCESS_KEYS_ROTATED:
        params:
          maxAccessKeyAge: "90"
      RDS_INSTANCE_PUBLIC_ACCESS_CHECK:
			# RDS_STORAGE_ENCRYPTED:                    ### <----------------------------
			# EC2_NO_AMAZON_KEY_PAIR:                   ### <----------------------------
```

2. Push the updates to the repo and wait till the end of push

# Control Tower Controls Management:

A controls is a high-level rule that provides ongoing governance for overall AWS environment. It's expressed in plain language. AWS Control Tower implements preventive, detective, and proactive controls that help you govern resources and monitor compliance across groups of AWS accounts.

CT Controls official documentation - [https://docs.aws.amazon.com/controltower/latest/userguide/controls.html](https://docs.aws.amazon.com/controltower/latest/userguide/controls.html)

## Create CT Controls:

1. Choose required controls by navigating to AWS Console —> AWS Control Tower —> All controls —> Click on required control —> Copy full name of the control after “/” in the API controlIdentifier 

```yaml
For example we have two option of controls naming

1. Name of the control - Require an Amazon API Gateway REST and WebSocket API to have logging activated

API controlIdentifier - arn:aws:controltower:eu-west-1::control/KBXFFJCCXCCZ

So we will copy KBXFFJCCXCCZ

2. Name of the control - Disallow cross-region networking for Amazon EC2, Amazon CloudFront, and AWS Global Accelerator

API controlIdentifier - arn:aws:controltower:eu-west-1::control/AWS-GR_DISALLOW_CROSS_REGION_NETWORKING 

So we will copy AWS-GR_DISALLOW_CROSS_REGION_NETWORKING
```

2. Navigate to `LZCZ-Core/env/{Your_ENV}/manifest.yaml` and add the previously copied name

```yaml
# manifest.yaml

organization:
  controls:
    - AWS-GR_DISALLOW_CROSS_REGION_NETWORKING             ### <----------------------------    
    - AWS-GR_AUDIT_BUCKET_ENCRYPTION_ENABLED
    - AWS-GR_LOG_GROUP_POLICY
    - AWS-GR_CLOUDTRAIL_VALIDATION_ENABLED
    - XLSIRLRDKWVQ # Name - [CT.CLOUDFORMATION.PR.1] Disallow management of resource types, modules, and hooks within the AWS CloudFormation registry
    - FBQFGSETXZRC # Name - [SH.Lambda.5] VPC Lambda functions should operate in more than one Availability Zone
    - KBXFFJCCXCCZ # Name - [CT.APIGATEWAY.PR.1] Require an Amazon API Gateway REST and WebSocket API to have logging activated              ### <---------------------------- 
```


💡 Please pay attention that “controls” still do not support scalable naming conventions at the API level, and we highly recommend setting a comment with the full name of the control to prevent misunderstandings in the future



3. Push the updates to the repo and wait till the end of push

## Delete CT Controls:

1. Navigate to `LZCZ-Core/env/{Your_ENV}/manifest.yaml` and delete or comment on the `controls` block

```yaml
# manifest.yaml

organization:
  controls:                   ### <-----
```

2. Push the updates to the repo and wait till the end of push
