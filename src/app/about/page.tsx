"use client";

export default function About() {
    return (
        <div style={{ padding: '2rem', backgroundColor: 'var(--background-color)', fontFamily: 'Roboto, sans-serif', color: 'var(--main-text-color)', maxWidth: '900px', margin: 'auto', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center', color: 'var(--titre-color)' }}>
                About MyAnyList
            </h1>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--titre-color)' }}>Introduction</h2>
                <p style={{ fontSize: '1.1rem', margin: '1rem 0' }}>
                    Welcome to MyAnyList, your ultimate platform for tracking and discovering TV series, movies, and anime. This guide will help you understand how the site works, from registration to exploring series details, and managing your personalized watchlist.
                </p>
                <img src="/path/to/homepage-screenshot.jpg" alt="Homepage Screenshot" style={{ width: '100%', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }} />
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--titre-color)' }}>How to Get Started</h2>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--titre-color)' }}>Registering and Logging In</h3>
                <p style={{ fontSize: '1.1rem', margin: '1rem 0' }}>
                    To start using MyAnyList, you need to create an account. Click on the "Register" button on the homepage, fill in your details, and you're ready to go! Already have an account? Just log in with your credentials.
                </p>
                <img src="/path/to/register-login-screenshot.jpg" alt="Register and Login Screenshot" style={{ width: '100%', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }} />
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--titre-color)' }}>Homepage Overview</h3>
                <p style={{ fontSize: '1.1rem', margin: '1rem 0' }}>
                    Once logged in, you'll be greeted by the homepage, which features personalized recommendations, the latest updated series, and trending content. This is your launchpad for exploring the vast collection of series available on MyAnyList.
                </p>
                <img src="/path/to/homepage-overview-screenshot.jpg" alt="Homepage Overview Screenshot" style={{ width: '100%', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }} />
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--titre-color)' }}>Exploring Series</h2>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--titre-color)' }}>Search and Filters</h3>
                <p style={{ fontSize: '1.1rem', margin: '1rem 0' }}>
                    Use the search page to find any series in our extensive database. You can apply advanced filters to narrow down your search by genre, language, production country, and more. Once you find a series you like, click the "Like" button to add it to your watchlist.
                </p>
                <img src="/path/to/search-page-screenshot.jpg" alt="Search Page Screenshot" style={{ width: '100%', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }} />

                <h3 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem', color: 'var(--titre-color)' }}>Series Details</h3>
                <p style={{ fontSize: '1.1rem', margin: '1rem 0' }}>
                    Click on any series to view detailed information, including seasons, episodes, genres, production companies, and more. You can also rate the series, leave a comment, and track your progress.
                </p>
                <img src="/path/to/series-details-screenshot.jpg" alt="Series Details Screenshot" style={{ width: '100%', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }} />
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--titre-color)' }}>Managing Your Watchlist</h2>
                <p style={{ fontSize: '1.1rem', margin: '1rem 0' }}>
                    Your "MyList" page allows you to see all the series you are following. You can apply filters here to sort your list by genre, progress, or rating. Stay on top of the latest episodes and never miss a release.
                </p>
                <img src="/path/to/mylist-screenshot.jpg" alt="MyList Screenshot" style={{ width: '100%', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }} />
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--titre-color)' }}>User Profile and Settings</h2>
                <p style={{ fontSize: '1.1rem', margin: '1rem 0' }}>
                    Your profile page is where you can manage your account settings. You can change your username or password, adjust your theme color, and view detailed statistics about your watched series, such as the total time spent, the most followed genres, and your highest-rated shows.
                </p>
                <img src="/path/to/profile-settings-screenshot.jpg" alt="Profile Settings Screenshot" style={{ width: '100%', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }} />
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--titre-color)' }}>About the Creator</h2>
                <p style={{ fontSize: '1.1rem', margin: '1rem 0' }}>
                    MyAnyList was created by Graziani Léo as a personal project. This site is a labor of love, designed to make tracking and discovering new series easier and more enjoyable for everyone.
                </p>
            </section>
        </div>
    );
}
