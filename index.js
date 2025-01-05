const INSTAGRAM_USER_DATA_URL = 'https://www.instagram.com/web/search/topsearch';
const INSTAGRAM_LIST_DATA_URL = 'https://www.instagram.com/graphql/query';
const INSTAGRAM_FOLLOWERS_HASH = 'c76146de99bb02f6415203be841dd25a';
const INSTAGRAM_FOLLOWINGS_HASH = 'd04b0a864b4b54837c0d870b0e77e076';

const username = '';

async function getUserId() {
  const res = await fetch(`${INSTAGRAM_USER_DATA_URL}/?query=${username}`);
  const data = await res.json();

  return data.users[0].user.pk;
}

function getVariables(userId, after) {
  return encodeURIComponent(
    JSON.stringify({
      id: userId,
      include_reel: true,
      fetch_mutual: true,
      first: 50,
      after: after,
    })
  );
}

async function getFollowers(userId) {
  let has_next = true;
  let after = null;
  let list = [];

  while (has_next) {
    const variables = getVariables(userId, after);
    const res = await fetch(
      `${INSTAGRAM_LIST_DATA_URL}/?query_hash=${INSTAGRAM_FOLLOWERS_HASH}&variables=${variables}`
    );
    const data = await res.json();
    const edgeFollowedBy = data.data.user.edge_followed_by;
    has_next = edgeFollowedBy.page_info.has_next_page;
    after = edgeFollowedBy.page_info.end_cursor;
    list = list.concat(
      edgeFollowedBy.edges.map(({ node }) => ({
        username: node.username,
      }))
    );
  }

  return list;
}

async function getFollowings(userId) {
  let has_next = true;
  let after = null;
  let list = [];

  while (has_next) {
    const variables = getVariables(userId, after);
    const res = await fetch(
      `${INSTAGRAM_LIST_DATA_URL}/?query_hash=${INSTAGRAM_FOLLOWINGS_HASH}&variables=${variables}`
    );
    const data = await res.json();
    const edgeFollow = data.data.user.edge_follow;
    has_next = edgeFollow.page_info.has_next_page;
    after = edgeFollow.page_info.end_cursor;
    list = list.concat(
      edgeFollow.edges.map(({ node }) => ({
        username: node.username,
        full_name: node.full_name,
      }))
    );
  }

  return list;
}

const userId = await getUserId();
let followers = await getFollowers(userId);
let followings = await getFollowings(userId);
let dontFollowMeBack = followings.filter(
  (following) => !followers.find((follower) => follower.username === following.username)
);

console.log('Result: ');
console.log(dontFollowMeBack);
