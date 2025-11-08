import type { FC, PropsWithChildren } from "react";

const RootLayout: FC<PropsWithChildren> = ({ children }) => (
	<html lang="en">
		<body>{children}</body>
	</html>
);

export default RootLayout;
