/* eslint-disable jsx-a11y/href-no-hash */
import React from 'react'
import { H5, H6, H3, H4, H2, H1 } from 'components/Heading'

const StyleDemo = () => (
  <article className="style-demo">
    <H3 className="gray-medium">Fonts</H3>
    <div className="font-demo avenir-medium-upper">Avenir Medium</div>
    <div className="font-demo avenir-medium">Avenir Medium</div>
    <div className="font-demo avenir-book">Avenir Book</div>
    <div className="font-demo avenir-book-oblique">Avenir Book Oblique</div>
    <div className="font-demo avenir-roman">Avenir Roman</div>
    <hr />
    <H3 className="gray-medium">Paragraph</H3>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Recusandae
      molestiae, perferendis tempora totam laboriosam perspiciatis porro,
      qui omnis suscipit dolorem placeat, voluptates ratione excepturi
      repellat! Delectus explicabo sint vitae reprehenderit sed nemo nihil
      fugiat voluptatibus aliquid quia repellat laborum deleniti quam soluta
      optio suscipit, beatae at accusamus laboriosam quasi illo!
    </p>
    <hr />
    <H3 className="gray-medium">Paragraph with a quote</H3>
    <p>
      Delectus explicabo sint vitae reprehenderit sed nemo nihil fugiat
      voluptatibus<q>ratione excepturi repellat</q> aliquid quia repellat
      laborum deleniti quam soluta optio suscipit, beatae at accusamus
      laboriosam quasi illo!
    </p>
    <hr />
    <H3 className="gray-medium">Anchor Tag In a Paragraph</H3>
    <p>
      Lorem ipsum dolor sit amet{' '}
      <a href="#">This is a standard anchor tag</a>, consectetur adipisicing
      elit. Repudiandae, unde? Facere maiores omnis iusto velit aliquid
      sapiente repellat enim ex, magni tempora quos ducimus molestias!
    </p>
    <hr />
    <H3 className="gray-medium">Blockquote</H3>
    <blockquote>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Repudiandae,
      unde? Facere maiores omnis iusto velit aliquid sapiente repellat enim
      ex, magni tempora quos ducimus molestias! Adipisci ratione
      dignissimos, est sint.
    </blockquote>
    <hr />
    <H3 className="gray-medium">Headings</H3>
    <H1>Heading Level 1</H1>
    <H2>Heading Level 2</H2>
    <H3>Heading Level 3</H3>
    <H4>Heading Level 4</H4>
    <H5>Heading Level 5</H5>
    <H6>Heading Level 6</H6>
    <hr />
    <H3 className="gray-medium">Ordered list</H3>
    <ol>
      <li>
        Lorem ipsum dolor sit amet, <br />consectetur adipisicing elit.
      </li>
      <li>Animi fuga esse quod quam. Esse, nam, obcaecati?</li>
      <li>Ex inventore enim ducimus alias tenetur modi deleniti.</li>
      <li>
        Iusto aperiam ullam voluptatibus voluptas laboriosam, tempora
        voluptatem.
        <ul>
          <li>Lorem ipsum dolor sit.</li>
        </ul>
      </li>
      <li>
        Error vero iusto natus, eligendi. Quibusdam, nisi, asperiores!
        <ul>
          <li>Lorem ipsum dolor sit.</li>
          <ul>
            <li>Lorem ipsum dolor sit.</li>
            <ul>
              <li>Lorem ipsum dolor sit.</li>
            </ul>
          </ul>
        </ul>
      </li>
    </ol>
    <hr />
    <H3 className="gray-medium">Unordered list</H3>
    <ul>
      <li>
        Lorem ipsum dolor sit amet, <br />consectetur adipisicing elit.
      </li>
      <li>Animi fuga esse quod quam. Esse, nam, obcaecati?</li>
      <li>Ex inventore enim ducimus alias tenetur modi deleniti.</li>
      <li>
        Iusto aperiam ullam voluptatibus voluptas laboriosam, tempora
        voluptatem.
        <ul>
          <li>Lorem ipsum dolor sit.</li>
          <ul>
            <li>Lorem ipsum dolor sit.</li>
            <ul>
              <li>Lorem ipsum dolor sit.</li>
            </ul>
          </ul>
        </ul>
      </li>
      <li>
        Error vero iusto natus, eligendi. Quibusdam, nisi, asperiores!<ul>
          <li>Lorem ipsum dolor sit.</li>
          <ul>
            <li>Lorem ipsum dolor sit.</li>
            <ul>
              <li>Lorem ipsum dolor sit.</li>
            </ul>
          </ul>
        </ul>
      </li>
    </ul>
    <hr />
    <H3 className="gray-medium">
      Headings, Paragraphs and Anchor Tags Combined
    </H3>
    <H1>H1 - Lorem ipsum dolor sit amet</H1>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Recusandae
      molestiae, <a href="#">perferendis tempora totam laboriosam</a>{' '}
      perspiciatis porro, qui omnis suscipit dolorem placeat, voluptates
      ratione excepturi repellat! Delectus explicabo sint vitae
      reprehenderit sed nemo nihil fugiat voluptatibus aliquid quia repellat
      laborum deleniti quam soluta optio suscipit, beatae at accusamus
      laboriosam quasi illo!
    </p>
    <hr />
    <H2>H2 - omnis iusto velit aliquid sapiente</H2>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Recusandae
      molestiae, <a href="#">perferendis tempora totam laboriosam</a>{' '}
      perspiciatis porro, qui omnis suscipit dolorem placeat, voluptates
      ratione excepturi repellat! Delectus explicabo sint vitae
      reprehenderit sed nemo nihil fugiat voluptatibus aliquid quia repellat
      laborum deleniti quam soluta optio suscipit, beatae at accusamus
      laboriosam quasi illo!
    </p>
    <hr />
    <H3> H3 - Repudiandae, unde Facere maiores</H3>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Recusandae
      molestiae, <a href="#">perferendis tempora totam laboriosam</a>{' '}
      perspiciatis porro, qui omnis suscipit dolorem placeat, voluptates
      ratione excepturi repellat! Delectus explicabo sint vitae
      reprehenderit sed nemo nihil fugiat voluptatibus aliquid quia repellat
      laborum deleniti quam soluta optio suscipit, beatae at accusamus
      laboriosam quasi illo!
    </p>
    <hr />
    <H4>H4 - Facere maiores omnis iusto velit</H4>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Recusandae
      molestiae, <a href="#">perferendis tempora totam laboriosam</a>{' '}
      perspiciatis porro, qui omnis suscipit dolorem placeat, voluptates
      ratione excepturi repellat! Delectus explicabo sint vitae
      reprehenderit sed nemo nihil fugiat voluptatibus aliquid quia repellat
      laborum deleniti quam soluta optio suscipit, beatae at accusamus
      laboriosam quasi illo!
    </p>
    <hr />
    <H5>H5 - sapiente repellat enim ex</H5>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Recusandae
      molestiae, <a href="#">perferendis tempora totam laboriosam</a>{' '}
      perspiciatis porro, qui omnis suscipit dolorem placeat, voluptates
      ratione excepturi repellat! Delectus explicabo sint vitae
      reprehenderit sed nemo nihil fugiat voluptatibus aliquid quia repellat
      laborum deleniti quam soluta optio suscipit, beatae at accusamus
      laboriosam quasi illo!
    </p>
    <hr />
    <H6>H6 - magni tempora quos ducimus molestias</H6>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Recusandae
      molestiae, <a href="#">perferendis tempora totam laboriosam</a>{' '}
      perspiciatis porro, qui omnis suscipit dolorem placeat, voluptates
      ratione excepturi repellat! Delectus explicabo sint vitae
      reprehenderit sed nemo nihil fugiat voluptatibus aliquid quia repellat
      laborum deleniti quam soluta optio suscipit, beatae at accusamus
      laboriosam quasi illo!
    </p>
  </article>
)

export default StyleDemo
/* eslint-enable jsx-a11y/href-no-hash */
