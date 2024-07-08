<p align="center">
  <a href="https://www.cobo.com/developers">
    <img src="v1/images/instroduction.png"/>
  </a>
</p>

<div align="center">
  <h1>Cobo Developer Hub</h1>

  <br />
  <br />
  <a href="">Developer Hub</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://www.cobo.com/news">News</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://discord.gg/FaZwQ9WYpj">Discord</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://twitter.com/Cobo_Global">Twitter</a>
  <br />

</div>

<br />

<div align="center">
  <h2>About Cobo</h2>
  <p align="left">
  Cobo is a trusted leader in digital asset custody and wallet infrastructure solutions. Founded in 2017 by blockchain pioneers, Cobo is trusted by more than 500 organizations worldwide, safeguarding billions of dollars in assets with a zero-incident security track record.

  Today, Cobo provides the industry’s only unified digital asset wallet platform that integrates all 4 wallet technologies in one place – Custodial Wallets, MPC Wallets, Smart Contract Wallets, and Exchange Wallets. By combining a comprehensive suite of wallet solutions with advanced risk controls and developer tools, Cobo empowers organizations and developers to innovate and scale with ease.

  Visit [Cobo](www.cobo.com) for more information.
  </p>
</div>

<br/>

## Get started

The Developer Hub mainly includes the following resources.:

- **[Custodial Wallets]()**. Cobo Custodial Wallets are a secure and regulated custodial wallet solution, designed specifically for institutions to manage digital assets. Custodial Wallets take the complexity out of securing your assets by managing the private keys on your behalf. 
- **[MPC Wallets]()**. Cobo MPC Wallets leverages advanced Multi-Party Computation (MPC) technology to implement a Threshold Signature Scheme (TSS). Cobo Portal offers two types of MPC Wallets: Organization-Controlled Wallets and User-Controlled Wallets.
- **[Smart Contract Wallets]()**. Cobo Smart Contract Wallets support a myriad of smart contract wallets, prominently featuring Safe{Wallet} alongside other Account Abstraction-based smart wallets. 
- **[Exchange Wallets]()**. Cobo Portal’s Exchange Wallets are your one-stop solution for managing multiple exchange accounts effortlessly.
  <br />

## GitHub repository directory
Currently we offer the content for WaaS 1.0 and WaaS 2.0 on the Developer Hub at the same time. Below is the directory structure for both versions:
**Note**: We recommend that you upgrade to 2.0 for additional features and enhanced performance.

```
- v2
  - api-references // The content under the API References tab, general information including overview, authentication, etc.
  - cobo_waas2_openapi_spec // The content under the API References tab, endpoint operation-level documentation in OpenAPI spec format
  - guides // (Coming soon) The content under the Guides tab, instructions on basic and advanced features
  - cobo-portal-apps // (Coming soon) The content related to Cobo Portal Apps.
  - developer-tools //  (Coming soon) The content under the Developer Tools tab, documentation for the WaaS SDKs
  - faqs // (Coming soon) The content under the FAQs tab, frequently asked questions

```

```
- v1
  - overview // The content under the Documentation tab, introduction to the WaaS service and wallets
  - get-started/overview // The content under the Get Started tab, basic workflows for different types of wallets
  - api-references // The content under the API References tab, endpoint operation-level documentation
  - guides/howtos // The content under the Guides tab, instructions on basic and advanced features
  - sdk-and-tools // The content under the SDKs and Tools tab, documentation for the WaaS SDKs and useful tools
  - faqs // The content under the FAQs tab, frequently asked questions
```

## Contributing

PRs are always welcome! To get started, follow this guide to build Cobo Developer Hub from
source on your local machine.

Step 1.clone

```
git clone git@github.com:CoboGlobal/developer-site.git
```

<br />

Step 2. Install Mintlify on your OS:

```
npm i -g mintlify
```

<br />

Step 3. Go to the docs directory (where you can find mint.json) and run the following command:

```
mintlify dev
```

The documentation website is now available at http://localhost:3000.

<br />

Step 4. Developer Hub is built on mintlify, its syntax is very similar to markdown

[Basic Syntax 👉](https://mintlify.com/docs/introduction)

<br />

Step 5. When you have completed the modifications locally, and after previewing with no issues,
please proceed with the standard Fork & Pull Request process for submission.

[How to Fork & Pull Request 👉](https://gist.github.com/Chaser324/ce0505fbed06b947d962)
<br />

## Contact us

[Join the discord 👉](https://discord.gg/FaZwQ9WYpj)
<br />
[Join the telegram 👉](https://t.me/coboglobal)
<br />
[Follow our twitter 👉](https://twitter.com/Cobo_Global)
<br />
[Follow our linkedln 👉](https://www.linkedin.com/company/cobo-global/)

## License

The code in this repository is developed and distributed under the
GPL 3.0 license. See [LICENSE](LICENSE) for details.
