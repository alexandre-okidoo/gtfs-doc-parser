String.prototype.replaceRelativeLinks = function () {
  return this.replace(/href=\"\//g, `href="${window.location.origin}/`);
};
String.prototype.replaceAnchorLinks = function () {
  return this.replace(
    /href=\"#/g,
    `href="${window.location.origin}${window.location.pathname}#`
  );
};

// Select files titles
let r = Array.from(document.querySelectorAll("h3[tabindex]"))
  // Ensure that only files are there
  .filter((fileTitle) => fileTitle.id.includes("txt"))
  .map((fileTitle) => {
    const fileName = fileTitle.id.replace("txt", "");

    // Find table
    let sibling = fileTitle.nextElementSibling;
    let description = `<a href="${window.location.origin}/transit/gtfs/reference#${fileTitle.id}">${fileName}</a><br/><br/>`;
    while (sibling) {
      if (sibling.matches(".devsite-table-wrapper")) break;
      description += sibling.innerHTML
        .replaceRelativeLinks()
        .replaceAnchorLinks();
      sibling = sibling.nextElementSibling;
    }
    const table = sibling.firstElementChild;

    // Parse table
    let body;
    Array.from(table.children).forEach((node) => {
      if (node.matches("tbody")) {
        body = node;
      }
    });

    // Parse lines
    const lines = Array.from(body.children).filter((l) => l.matches("tr"));

    const properties = lines.map((line) => {
      const columns = Array.from(line.children);

      const fieldName = columns[0].firstElementChild.innerText;
      const type = columns[1].innerText;
      const required = /(?<!Conditionally )Required/.test(columns[2].innerHTML);
      const description = columns[3].innerHTML
        .replaceRelativeLinks()
        .replaceAnchorLinks();

      return { fieldName, type, required, description };
    });

    return {
      fileName,
      description,
      properties,
    };
  });
JSON.stringify(r);
