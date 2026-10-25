function AccountFooter({
  version = "VER_2.003 | Alone",
  className = "account-footer"
}) {
  return (
    <footer className={className}>
      <span>
        Outmoded
      </span>

      <span>
        {version}
      </span>
    </footer>
  );
}

export default AccountFooter;
