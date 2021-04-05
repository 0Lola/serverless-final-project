import dateFormat from 'dateformat'
import { History } from 'history'
import * as React from 'react'
import {
  Button,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createDaily, deleteDaily, getDaily, patchDaily } from '../api/daily-api'
import Auth from '../auth/Auth'
import { Daily } from '../types/Daily'

interface Props {
  auth: Auth
  history: History
}

interface State {
  dailyList: Daily[]
  newTitle: string
  newContent: string
  loading: boolean
}

export class DailyList extends React.PureComponent<Props, State> {
  state: State = {
    dailyList: [],
    newTitle: '',
    newContent: '',
    loading: true
  }

  handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTitle: event.target.value })
  }

  handleContentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newContent: event.target.value })
  }

  onEditButtonClick = (id: string) => {
    this.props.history.push(`/daily/${id}/edit`)
  }

  onDailyCreate = async () => {
    try {
      const newDaily = await createDaily(this.props.auth.getIdToken(), {
        title: this.state.newTitle,
        content: this.state.newContent,
        date: this.calculateDueDate()
      })
      this.setState({
        dailyList: [...this.state.dailyList, newDaily],
        newTitle: '',
        newContent : ''
      })
    } catch {
      alert('Daily creation failed')
    }
  }

  onDailyDelete = async (id: string) => {
    try {
      await deleteDaily(this.props.auth.getIdToken(), id)
      this.setState({
        dailyList: this.state.dailyList.filter(daily => daily.id != id)
      })
    } catch {
      alert('Daily deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const dailyList = await getDaily(this.props.auth.getIdToken())
      this.setState({
        dailyList,
        loading: false
      })
    } catch (e) {
      alert(`Failed to fetch daily: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Daily</Header>

        {this.renderCreateDailyInput()}

        {this.renderDaily()}
      </div>
    )
  }

  renderCreateDailyInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            style={{
                paddingRight:10,
            }}
            placeholder="title"
            onChange={this.handleTitleChange}
          />
          <Input
            style={{
                paddingRight:10,
            }}
            placeholder="content"
            onChange={this.handleContentChange}
          />
          <Button color="blue" onClick={this.onDailyCreate}>
            Create Daily
          </Button>
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderDaily() {
    if (this.state.loading) {
      return this.renderLoading()
    }

    return this.renderDailyList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading TODOs
        </Loader>
      </Grid.Row>
    )
  }

  renderDailyList() {
    return (
      <Grid padded>
        {this.state.dailyList.map((daily, pos) => {
          return (
            <Grid.Row key={daily.id}>
              <Grid.Column width={3} verticalAlign="middle">
                {daily.title}
              </Grid.Column>
              <Grid.Column width={3} verticalAlign="middle">
                {daily.content}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {daily.date}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(daily.id)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onDailyDelete(daily.id)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {daily.imageUrl && (
                <Image src={daily.imageUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
