import React from "react";
import { WebView } from "react-native-webview";

export default function PayHereScreen({ route }) {
  const { paymentData } = route.params;

  const html = `
    <html>
      <body onload="document.forms[0].submit()">
        <form method="POST" action="https://sandbox.payhere.lk/pay/checkout">
          ${Object.entries(paymentData)
            .map(
              ([key, value]) =>
                `<input type="hidden" name="${key}" value="${value}" />`
            )
            .join("")}
        </form>
      </body>
    </html>
  `;

  return <WebView source={{ html }} />;
}
