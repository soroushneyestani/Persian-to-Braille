const DEVELOPMENT_BASE_URL = "https://localhost:3000";
const DEVELOPMENT_SUPPORT_URL =
  "https://github.com/soroushneyestani/Braille-Hub";

function isLoopbackHost(hostname) {
  const value = hostname.toLowerCase();

  return (
    value === "localhost" ||
    value === "127.0.0.1" ||
    value === "::1" ||
    value === "[::1]"
  );
}

export function normalizeProductionBaseUrl(input) {
  if (typeof input !== "string" || input.trim() === "") {
    throw new Error(
      "OFFICE_ADDIN_PRODUCTION_BASE_URL is required.",
    );
  }

  let url;

  try {
    url = new URL(input.trim());
  } catch {
    throw new Error(
      "Production base URL must be an absolute HTTPS URL.",
    );
  }

  if (url.protocol !== "https:") {
    throw new Error(
      "Production base URL must use HTTPS.",
    );
  }

  if (
    url.username !== "" ||
    url.password !== ""
  ) {
    throw new Error(
      "Production base URL must not contain credentials.",
    );
  }

  if (isLoopbackHost(url.hostname)) {
    throw new Error(
      "Production base URL must not use localhost or another loopback host.",
    );
  }

  if (url.search !== "" || url.hash !== "") {
    throw new Error(
      "Production base URL must not contain a query string or fragment.",
    );
  }

  const pathname =
    url.pathname === "/"
      ? ""
      : url.pathname.replace(/\/+$/, "");

  return `${url.origin}${pathname}`;
}

export function createMarketplaceComplianceUrls(
  productionBaseUrl,
) {
  const baseUrl =
    normalizeProductionBaseUrl(
      productionBaseUrl,
    );

  return {
    support: `${baseUrl}/support.html`,
    privacy: `${baseUrl}/privacy.html`,
    eula: `${baseUrl}/eula.html`,
  };
}

export function createProductionManifest(
  developmentManifest,
  productionBaseUrl,
) {
  const baseUrl =
    normalizeProductionBaseUrl(
      productionBaseUrl,
    );

  if (
    !developmentManifest.includes(
      DEVELOPMENT_BASE_URL,
    )
  ) {
    throw new Error(
      "Development manifest no longer contains the frozen localhost base URL.",
    );
  }

  const productionManifest =
    developmentManifest
      .split(DEVELOPMENT_BASE_URL)
      .join(baseUrl);

  if (
    productionManifest.includes(
      DEVELOPMENT_BASE_URL,
    )
  ) {
    throw new Error(
      "Production manifest still contains the development localhost base URL.",
    );
  }

  return {
    baseUrl,
    manifest: productionManifest,
  };
}

export function createMarketplaceSubmissionManifest(
  developmentManifest,
  productionBaseUrl,
) {
  const production =
    createProductionManifest(
      developmentManifest,
      productionBaseUrl,
    );

  const developmentSupport =
    `<SupportUrl DefaultValue="${DEVELOPMENT_SUPPORT_URL}"/>`;

  if (
    !production.manifest.includes(
      developmentSupport,
    )
  ) {
    throw new Error(
      "Development manifest no longer contains the frozen development SupportUrl.",
    );
  }

  const complianceUrls =
    createMarketplaceComplianceUrls(
      production.baseUrl,
    );

  const marketplaceSupport =
    `<SupportUrl DefaultValue="${complianceUrls.support}"/>`;

  const marketplaceManifest =
    production.manifest.replace(
      developmentSupport,
      marketplaceSupport,
    );

  if (
    marketplaceManifest.includes(
      developmentSupport,
    )
  ) {
    throw new Error(
      "Marketplace manifest still contains the frozen development SupportUrl.",
    );
  }

  return {
    baseUrl: production.baseUrl,
    complianceUrls,
    manifest: marketplaceManifest,
  };
}

export {
  DEVELOPMENT_BASE_URL,
  DEVELOPMENT_SUPPORT_URL,
};
