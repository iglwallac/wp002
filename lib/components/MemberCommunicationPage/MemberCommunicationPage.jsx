import React from 'react'
import { Map } from 'immutable'
import { connect as connectRedux } from 'react-redux'
import { historyRedirect } from 'services/navigation'
import GaiaLogo, { TYPE_TEAL } from 'components/GaiaLogo'
import Link from 'components/Link'
import { H5 } from 'components/Heading'

function MemberCommunicationPage (props) {
  const { user = Map(), auth, history } = props
  const language = user.getIn(['data', 'language'])

  if (!auth.get('jwt')) {
    historyRedirect({ history, url: '/', auth, language })
    return null
  }

  return (
    <div className="member-communication">
      <div className="member-communication__header">
        <div className="member-communication__link">
          <Link directLink to="/" className="member-communication__link-component">
            Gaia.com Home
          </Link>
        </div>
        <div className="member-communication__logo">
          <GaiaLogo type={TYPE_TEAL} className={['header__logo']} />
          <div className="member-communication__subtitle">Gaia Announcements</div>
        </div>
      </div>
      <div className="member-communication__text">
        <H5>
          New Releases
        </H5>
        <ul>
          <li>
            <Link to="/series/initiation">Initiation</Link> with Matias De Stefano (New Gaia Original Series)
          </li>
          <li>
            <Link to="/series/ascension-keepers">Ascension Keepers</Link> with William Henry (New Gaia Original Series)
          </li>
          <li>
            New season of Cosmic Disclosure with <Link to="/search?q=david%20adair&sort=recent">David Adair</Link>
          </li>
          <li>
            <Link to="/series/interviews-extra-dimensionals">Interviews with Extra Dimensionals</Link> Season 1
          </li>
          <li>
            <Link to="/series/land-and-sacred">The Land and the Sacred</Link>
          </li>
          <li>
            <Link to="/series/conscious-life-expo-2020">Conscious Life Expo 2020</Link> featuring Gregg Braden, Bashar channeled by Darryl Anka, Emery Smith, Billy Carson, Dr. Daniel Estulin Ph.D. and Scott Wolter
          </li>
        </ul>
        <H5>
          Coming Soon on Gaia
        </H5>
        <ul>
          <li>New Gaia Original Series Inner Evolution with Bruce Lipton (March)</li>
          <li>New season of Interviews with Extra Dimensionals with Reuben Langdon</li>
          <li>New Gaia Original Series Quantum Revolution with Nassim Haramein (April)</li>
          <li>New season of Initiation with Matias De Stefano (April)</li>
          <li>New documentary Third Eye Spy (April)</li>
        </ul>
        <br />
        <H5>Message to Our Members</H5>
        {/* eslint-disable-next-line */}
        {<p>{'Cosmic Disclosure Update: Corey Goode\'s content has been removed from the Gaia platform. Gaia has been disappointed by the disparaging comments Corey Goode has made about Gaia and our employees. After much research and investigation, it has become clear to Gaia that we cannot continue to support Corey Goode\'s narrative.'}</p>}
        <br />
        <H5>Live Events</H5>
        <ul>
          <li>
            Tickets are still on sale to see the following:
            <ul>
              <li>
                {'Gregg Braden\'s '}
                <Link to="/events/gregg-braden-march-2020">{'"Radical Longevity"'}</Link>
                {' March 14-15'}
              </li>
              <li>
                {'Graham Hancock\'s '}
                <Link to="/events/graham-hancock-magical-mystery-tour">{'"A Magical Mystery Tour"'}</Link>
                {' May 8-10'}
              </li>
              <li>
                {'Nassim Haramein\'s '}
                <Link to="/events/nassim-haramein-the-universe-and-you">{'"The Universe and You"'}</Link>
                {' June 12-14'}
              </li>
            </ul>
          </li>
        </ul>
        <H5>
          Check out the new <a href="https://www.gaia.com/lp/weekly-guide">Gaia Guide</a> we’re testing to see what’s playing now
        </H5>
        <br />
        <H5>
          Your friends watch free!
        </H5>
        <ul>
          {/* eslint-disable-next-line */}
          <li>Gaia is the only streaming platform with unlimited sharing of any original series episode. Share a video and spark deeper conversations with your friends and family today.</li>
        </ul>
      </div>
    </div>
  )
}

export default connectRedux(
  state => ({
    auth: state.auth,
  }),
)(MemberCommunicationPage)
