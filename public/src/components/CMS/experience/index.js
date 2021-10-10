/**
 *  Create an experience object
 * @function experienceFactory
 * @param {String} category
 * @returns {Object}
 */
export const experienceFactory = (category) => ({
  // this is hacky but the years from the backend are returned as (####) or (TBA) so to match we generate years
  // as (####)
  year: `(${Number(new Date().getFullYear())})`,
  link: '',
  credit: '',
  tba: false,
  category,
});

export const lookup = {
  voiceCredits: 'Voice Credits',
  musicGames: 'Music - Games',
  musicMiscellaneous: 'Music - Miscellaneous',
  streamingCredits: 'Streaming - Credits',
};

/**
 * Credits can optionally have a year, so we need to append the year to the front if it exists
 * @function formatCredit
 * @param {Object} credit
 * @returns {String}
 */
export const formatCredit = (credit) => (credit.year ? `${credit.year} ${credit.credit}` : credit.credit);
