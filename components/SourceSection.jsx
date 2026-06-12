export function SourceSection({ diagnostics }) {
  return (
    <section className="sources-section" aria-labelledby="sourcesHeading">
      <div>
        <p className="eyebrow">Traceability</p>
        <h2 id="sourcesHeading">Live data trace</h2>
      </div>
      <DataTraceTable diagnostics={diagnostics} />
    </section>
  );
}

export function DataTraceTable({ diagnostics }) {
  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th scope="col">Data</th>
            <th scope="col">Status</th>
            <th scope="col">Live source</th>
            <th scope="col">Source URL</th>
          </tr>
        </thead>
        <tbody>
          {diagnostics.map((item) => (
            <tr key={`${item.section}-${item.field}`}>
              <td>
                <strong>{item.field}</strong>
                <span>{item.section}</span>
              </td>
              <td>
                <span
                  className={`status-badge ${item.status === "available" ? "" : "warning"}`}
                >
                  {item.status}
                </span>
              </td>
              <td>{item.reason}</td>
              <td>
                <SourceLinks source={item.source} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SourceLinks({ source }) {
  return source.split(" + ").map((url) => (
    <a href={url} key={url} rel="noreferrer" target="_blank">
      Open
    </a>
  ));
}
