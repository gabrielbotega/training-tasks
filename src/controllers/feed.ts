import { Request, Response } from "express";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Convert import.meta.url to __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const p = path.join(__dirname, "../data/posts.json");

const getPostsFromFile = async (): Promise<Post[]> => {
  try {
    const data = await fs.readFile(p, "utf8");
    // console.log(data);
    const posts = JSON.parse(data);
    // console.log(posts);
    return posts;
  } catch (err) {
    await fs.mkdir(path.dirname(p), { recursive: true });

    await fs.writeFile(p, []);
    return [];
  }
};

class Post {
  id: number;
  title: string;
  content: string;

  constructor(t: string, c: string) {
    this.id = Math.random();
    this.title = t;
    this.content = c;
  }

  async addToPosts(): Promise<boolean> {
    if (!this.content || !this.title) {
      return false;
    }
    const posts = await getPostsFromFile();

    // console.log(this);
    posts.push(this);
    // console.log(posts);

    try {
      // Ensure the directory exists
      await fs.mkdir(path.dirname(p), { recursive: true });

      await fs.writeFile(p, JSON.stringify(posts));

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  static async updatePost(
    id: number,
    content: string
  ): Promise<boolean | Post[]> {
    try {
      const postsOnFile = await getPostsFromFile();
      console.log(postsOnFile);

      const postToUpdate = postsOnFile.find((p) => p.id === id);

      if (!postToUpdate || !content) {
        return false;
      }

      postToUpdate.content = content;

      await fs.writeFile(p, JSON.stringify(postsOnFile));

      return postsOnFile;
    } catch (err) {
      console.log(err);
    }
  }
}

// Interface because I just want to specify what to receive
type CreatedPostReqBody = {
  title: string;
  content: string;
};

// // Interface because I just want to specify what to receive
// type UpdatePostReqBody = {
//   id: number;
//   content: string;
// };

// let posts: Post[] = [];

export const getPosts = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const postsOnFile = await getPostsFromFile();

    if (postsOnFile.length === 0) {
      return res.status(400).json({
        message: "there is no post to get",
      });
    }

    return res.status(200).json({
      postsOnFile,
    });
  } catch (err) {
    console.log(err);
  }
};

/*
Request type definitions 
1 - Params: The type of the route parameters.
2 - ResBody: The type of the response body.
3 - ReqBody: The type of the request body.
4 - ReqQuery: The type of the query string.
*/
export const createPost = async (
  req: Request<unknown, unknown, CreatedPostReqBody>,
  res: Response
): Promise<Response> => {
  const { title, content } = req.body;

  const newPost: Post = new Post(title, content);

  const success = await newPost.addToPosts();

  if (!success) {
    return res.status(400).json({
      message: "Please, provide title and content",
    });
  }

  return res.status(200).json({
    message: "new post added",
    newPost,
  });
};

export const updatePost = async (
  req: Request<{ postId: number }, unknown, { content: string }>,
  res: Response
): Promise<Response> => {
  const { content } = req.body;
  const id: number = Number(req.params.postId);
  try {
    const updatedPosts: Post[] | boolean = await Post.updatePost(id, content);

    //if falsy value
    if (!updatedPosts) {
      return res.status(400).json({
        message:
          "Please, provide the correct ID or a content to update the post",
      });
    }

    return res.status(200).json({
      message: "Post updated successfully",
      updatedPost: updatedPosts,
    });
  } catch (err) {
    console.log(err);
  }
};

export default { getPosts, createPost, updatePost };
