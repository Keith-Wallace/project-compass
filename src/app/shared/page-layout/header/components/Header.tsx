import { useNavigate } from 'react-router-dom'
import RollingThreeLogo from '../../../../../assets/rolling-three-whitebg-logo.png';
import { useCurrentUser } from '../api/getCurrentUser.api';
import '../styles/header.css';

type HeaderProps = {
  isPublic?: boolean;
};

// "sarah.connor@example.com" -> "SC", "Sarah Connor" -> "SC", "sarah" -> "S"
function getInitials(name: string): string {
	return name
		.split('@')[0]
		.split(/[^a-zA-Z0-9]+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0].toUpperCase())
		.join('');
}

export default function Header({ isPublic = false }: HeaderProps) {
	const navigate = useNavigate()
	const user = useCurrentUser();

	// Falls back to the login email if no username is stored in metadata
	const username: string = user?.user_metadata?.username ?? user?.email ?? '';

  return (
    <header className="topbar">
			<a className="btn-link" onClick={() => navigate('/')}>
				<img className="page-header-logo" src={RollingThreeLogo} alt="Rolling Three" height="72px" />
			</a>
			{!isPublic && user && (
				<div className="topbar-actions">
					<button className="icon-btn" aria-label="Notifications">
						<span className="icon" aria-hidden="true">&#128276;</span>
					</button>
					<div className="avatar" aria-hidden="true">{getInitials(username)}</div>
					<span className="topbar-username">{username}</span>
				</div>
			)}
    </header>
  );
};