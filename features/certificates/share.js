export const linkedInAddUrl = ({ certificate, organization, verifyUrl }) => {
  const issued = new Date(certificate.issuedAt);
  const params = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: certificate.courseTitle,
    organizationName: organization,
    issueYear: String(issued.getFullYear()),
    issueMonth: String(issued.getMonth() + 1),
    certUrl: verifyUrl,
    certId: certificate.code,
  });
  return `https://www.linkedin.com/profile/add?${params}`;
};
