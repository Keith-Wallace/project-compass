import RollingThreeLogo from '../../../../../assets/rolling-three-whitebg-logo.png';
import '../styles/header.css';

type HeaderProps = {
  isPublic?: boolean;
};

export default function Header({ isPublic = false }: HeaderProps) {
  return (
    <header className="topbar">
			<img className="page-header-logo" src={RollingThreeLogo} alt="Rolling Three" height="64px" />
			{!isPublic && (
				<div className="topbar-actions">
					<button className="icon-btn" aria-label="Notifications">
						<span className="icon" aria-hidden="true">&#128276;</span>
					</button>
					<div className="avatar">FL</div>
				</div>
			)}
    </header>
  );
};
