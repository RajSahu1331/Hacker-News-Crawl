import { Link } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import { useLogout } from '../hooks/useLogout.js';
import styles from '../styles/styles.module.scss'

const NavBar = () => {
    const { user } = useAuthContext();
    const { logout } = useLogout();
    const handleClick = () => logout();

    return (
        <header>
            <nav className={styles.header}>
                <ul>
                    <li>
                        <Link to="/"> <h2>Hacker News</h2> </Link>
                    </li>
                </ul>


                {user ? (
                    <div>

                        <button onClick={handleClick}>
                            Logout
                        </button>
                    </div>

                ) : (
                    <div>
                        <Link to="/login">
                            <button>Login</button>
                        </Link>
                        <Link to="/signup">
                            <button>Signup</button>
                        </Link>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default NavBar;